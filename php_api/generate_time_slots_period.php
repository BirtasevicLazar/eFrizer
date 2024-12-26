<?php
require_once 'cors.php'; 
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}


try {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!isset($data->barberId) || !isset($data->salonId) || !isset($data->days)) {
        throw new Exception('Nedostaju potrebni podaci');
    }

    // Prvo brišemo postojeće slotove za ovaj period
    $deleteQuery = "DELETE FROM time_slots 
                   WHERE frizer_id = :barberId 
                   AND salon_id = :salonId 
                   AND date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL :days DAY)";
                   
    $stmt = $conn->prepare($deleteQuery);
    $stmt->bindParam(':barberId', $data->barberId);
    $stmt->bindParam(':salonId', $data->salonId);
    $stmt->bindParam(':days', $data->days);
    $stmt->execute();

    // Za svaki dan u periodu
    for ($i = 0; $i < $data->days; $i++) {
        $date = date('Y-m-d', strtotime("+$i days"));
        $dayOfWeek = date('N', strtotime($date));

        // Dohvatamo radno vreme za taj dan
        $query = "SELECT * FROM working_hours 
                 WHERE frizer_id = :barberId 
                 AND salon_id = :salonId 
                 AND day_of_week = :dayOfWeek";
                 
        $stmt = $conn->prepare($query);
        $stmt->bindParam(':barberId', $data->barberId);
        $stmt->bindParam(':salonId', $data->salonId);
        $stmt->bindParam(':dayOfWeek', $dayOfWeek);
        $stmt->execute();

        $workingHours = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($workingHours && $workingHours['is_working']) {
            // Generišemo slotove za ovaj dan
            $currentTime = strtotime($workingHours['start_time']);
            $endTime = strtotime($workingHours['end_time']);
            
            while ($currentTime < $endTime) {
                $timeSlot = date('H:i:s', $currentTime);
                
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
                    // Insert slot into database
                    $insertQuery = "INSERT INTO time_slots (salon_id, frizer_id, date, time_slot) 
                                   VALUES (:salonId, :barberId, :date, :timeSlot)";
                    $stmt = $conn->prepare($insertQuery);
                    $stmt->bindParam(':salonId', $data->salonId);
                    $stmt->bindParam(':barberId', $data->barberId);
                    $stmt->bindParam(':date', $date);
                    $stmt->bindParam(':timeSlot', $timeSlot);
                    $stmt->execute();
                }

                $currentTime += 30 * 60; // Add 30 minutes to the current time
            }
        }
    }

    echo json_encode(['success' => true]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
} 