<?php
require_once 'cors.php'; 
require_once 'config.php';

try {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!isset($data->barberId) || !isset($data->salonId)) {
        throw new Exception('Nedostaju potrebni podaci');
    }

    $availableSlots = [];
    $startDate = date('Y-m-d');
    $endDate = date('Y-m-d', strtotime('+14 days'));

    // Prolazimo kroz svaki dan u naredne 2 nedelje
    for ($date = $startDate; $date <= $endDate; $date = date('Y-m-d', strtotime($date . ' +1 day'))) {
        $dayOfWeek = date('N', strtotime($date));
        
        // Dobavljamo radno vreme za taj dan
        $stmt = $conn->prepare("
            SELECT 
                is_working,
                TIME_FORMAT(start_time, '%H:%i') as start_time,
                TIME_FORMAT(end_time, '%H:%i') as end_time,
                has_break,
                TIME_FORMAT(break_start, '%H:%i') as break_start,
                TIME_FORMAT(break_end, '%H:%i') as break_end
            FROM working_hours 
            WHERE barber_id = :barberId 
            AND salon_id = :salonId 
            AND day_of_week = :dayOfWeek
        ");

        $stmt->execute([
            ':barberId' => $data->barberId,
            ':salonId' => $data->salonId,
            ':dayOfWeek' => $dayOfWeek
        ]);

        $workingHours = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($workingHours && $workingHours['is_working']) {
            // Generišemo vremenske slotove za taj dan
            $slots = [];
            $currentTime = strtotime($workingHours['start_time']);
            $endTime = strtotime($workingHours['end_time']);
            
            while ($currentTime < $endTime) {
                $timeSlot = date('H:i', $currentTime);
                
                // Proveravamo da li je slot u vreme pauze
                $isBreakTime = false;
                if ($workingHours['has_break']) {
                    $breakStart = strtotime($workingHours['break_start']);
                    $breakEnd = strtotime($workingHours['break_end']);
                    if ($currentTime >= $breakStart && $currentTime < $breakEnd) {
                        $isBreakTime = true;
                    }
                }

                if (!$isBreakTime) {
                    // Proveravamo postojeće rezervacije
                    $checkStmt = $conn->prepare("
                        SELECT COUNT(*) 
                        FROM appointments 
                        WHERE barber_id = :barberId 
                        AND salon_id = :salonId 
                        AND date = :date 
                        AND time = :time
                        AND status != 'cancelled'
                    ");

                    $checkStmt->execute([
                        ':barberId' => $data->barberId,
                        ':salonId' => $data->salonId,
                        ':date' => $date,
                        ':time' => $timeSlot
                    ]);

                    $isBooked = $checkStmt->fetchColumn() > 0;

                    if (!$isBooked) {
                        $slots[] = [
                            'time' => $timeSlot,
                            'available' => true
                        ];
                    }
                }
                
                $currentTime = strtotime('+15 minutes', $currentTime);
            }

            if (!empty($slots)) {
                $availableSlots[$date] = $slots;
            }
        }
    }

    echo json_encode([
        'success' => true,
        'slots' => $availableSlots
    ]);

} catch(Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?> 