<?php
header('Access-Control-Allow-Origin: http://192.168.0.31:5173');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

require_once 'config.php';

try {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!isset($data->barberId) || !isset($data->salonId)) {
        throw new Exception('Nedostaju potrebni podaci');
    }

    // Generišemo termine za naredne 2 nedelje
    $startDate = date('Y-m-d');
    $endDate = date('Y-m-d', strtotime('+14 days'));

    $conn->beginTransaction();

    // Prvo brišemo stare termine
    $deleteStmt = $conn->prepare("
        DELETE FROM time_slots 
        WHERE salon_id = ? AND frizer_id = ? 
        AND date >= ? AND date <= ?
    ");
    $deleteStmt->execute([$data->salonId, $data->barberId, $startDate, $endDate]);

    // Pripremamo insert statement
    $insertStmt = $conn->prepare("
        INSERT INTO time_slots 
        (salon_id, frizer_id, date, time_slot, is_available) 
        VALUES (?, ?, ?, ?, 1)
    ");

    // Za svaki dan u periodu
    $currentDate = new DateTime($startDate);
    $lastDate = new DateTime($endDate);

    while ($currentDate <= $lastDate) {
        $dateStr = $currentDate->format('Y-m-d');
        $dayOfWeek = $currentDate->format('N'); // 1 (ponedeljak) do 7 (nedelja)

        // Dohvatamo radno vreme za taj dan
        $workingHoursStmt = $conn->prepare("
            SELECT * FROM working_hours 
            WHERE barber_id = ? AND salon_id = ? AND day_of_week = ?
        ");
        $workingHoursStmt->execute([$data->barberId, $data->salonId, $dayOfWeek]);
        $workingHours = $workingHoursStmt->fetch(PDO::FETCH_ASSOC);

        if ($workingHours && $workingHours['is_working']) {
            $startTime = strtotime($workingHours['start_time']);
            $endTime = strtotime($workingHours['end_time']);
            
            // Generišemo 15-minutne intervale
            for ($time = $startTime; $time < $endTime; $time += 900) { // 900 sekundi = 15 minuta
                $timeSlot = date('H:i', $time);
                
                // Preskačemo pauzu ako postoji
                if ($workingHours['has_break']) {
                    $breakStart = strtotime($workingHours['break_start']);
                    $breakEnd = strtotime($workingHours['break_end']);
                    if ($time >= $breakStart && $time < $breakEnd) {
                        continue;
                    }
                }

                $insertStmt->execute([
                    $data->salonId,
                    $data->barberId,
                    $dateStr,
                    $timeSlot
                ]);
            }
        }
        
        $currentDate->modify('+1 day');
    }

    $conn->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Termini su uspešno generisani'
    ]);

} catch (Exception $e) {
    if ($conn->inTransaction()) {
        $conn->rollBack();
    }
    error_log("Greška pri generisanju termina: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?> 