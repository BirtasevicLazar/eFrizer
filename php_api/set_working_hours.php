<?php
require_once 'cors.php'; 
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}


try {
    $input = file_get_contents('php://input');
    error_log("Primljeni podaci: " . $input);
    
    $data = json_decode($input);
    if (!$data || !isset($data->barberId) || !isset($data->salonId) || !isset($data->workingHours)) {
        throw new Exception('Nedostaju potrebni podaci');
    }

    $conn->beginTransaction();

    $deleteStmt = $conn->prepare("
        DELETE FROM working_hours 
        WHERE barber_id = :barberId AND salon_id = :salonId
    ");
    
    $deleteStmt->execute([
        ':barberId' => $data->barberId,
        ':salonId' => $data->salonId
    ]);

    $insertStmt = $conn->prepare("
        INSERT INTO working_hours 
        (salon_id, barber_id, day_of_week, is_working, start_time, end_time, has_break, break_start, break_end)
        VALUES 
        (:salonId, :barberId, :dayOfWeek, :isWorking, :startTime, :endTime, :hasBreak, :breakStart, :breakEnd)
    ");

    foreach ($data->workingHours as $day) {
        $insertStmt->execute([
            ':salonId' => $data->salonId,
            ':barberId' => $data->barberId,
            ':dayOfWeek' => $day->dayOfWeek,
            ':isWorking' => $day->isWorking ? 1 : 0,
            ':startTime' => $day->startTime,
            ':endTime' => $day->endTime,
            ':hasBreak' => $day->hasBreak ? 1 : 0,
            ':breakStart' => $day->hasBreak ? $day->breakStart : null,
            ':breakEnd' => $day->hasBreak ? $day->breakEnd : null
        ]);
    }

    foreach ($data->workingHours as $day) {
        if ($day->isWorking) {
            $deleteOutsideHoursStmt = $conn->prepare("
                DELETE FROM time_slots 
                WHERE salon_id = :salonId 
                AND frizer_id = :barberId 
                AND (
                    TIME(time_slot) < :startTime 
                    OR TIME(time_slot) >= :endTime
                    OR (
                        :hasBreak = 1 
                        AND TIME(time_slot) >= :breakStart 
                        AND TIME(time_slot) < :breakEnd
                    )
                )
            ");

            $deleteOutsideHoursStmt->execute([
                ':salonId' => $data->salonId,
                ':barberId' => $data->barberId,
                ':startTime' => $day->startTime,
                ':endTime' => $day->endTime,
                ':hasBreak' => $day->hasBreak ? 1 : 0,
                ':breakStart' => $day->hasBreak ? $day->breakStart : '00:00',
                ':breakEnd' => $day->hasBreak ? $day->breakEnd : '00:00'
            ]);

            // Nakon brisanja starih slotova, generišemo nove prema radnom vremenu
            $startDate = date('Y-m-d');
            $endDate = date('Y-m-d', strtotime('+14 days'));
            $currentDate = new DateTime($startDate);
            $lastDate = new DateTime($endDate);

            while ($currentDate <= $lastDate) {
                if ($currentDate->format('N') == $day->dayOfWeek) {
                    $dateStr = $currentDate->format('Y-m-d');
                    $startTime = strtotime($day->startTime);
                    $endTime = strtotime($day->endTime);

                    // Generišemo 15-minutne intervale
                    for ($time = $startTime; $time < $endTime; $time += 900) {
                        $timeSlot = date('H:i:s', $time);
                        
                        // Preskačemo pauzu ako postoji
                        if ($day->hasBreak) {
                            $breakStart = strtotime($day->breakStart);
                            $breakEnd = strtotime($day->breakEnd);
                            if ($time >= $breakStart && $time < $breakEnd) {
                                continue;
                            }
                        }

                        $insertSlotStmt = $conn->prepare("
                            INSERT INTO time_slots 
                            (salon_id, frizer_id, date, time_slot, is_available) 
                            VALUES 
                            (:salonId, :barberId, :date, :timeSlot, 1)
                        ");

                        $insertSlotStmt->execute([
                            ':salonId' => $data->salonId,
                            ':barberId' => $data->barberId,
                            ':date' => $dateStr,
                            ':timeSlot' => $timeSlot
                        ]);
                    }
                }
                $currentDate->modify('+1 day');
            }
        } else {
            $deleteNonWorkingDayStmt = $conn->prepare("
                DELETE FROM time_slots 
                WHERE salon_id = :salonId 
                AND frizer_id = :barberId 
                AND DAYOFWEEK(DATE(time_slot)) = :dayOfWeek
            ");

            $deleteNonWorkingDayStmt->execute([
                ':salonId' => $data->salonId,
                ':barberId' => $data->barberId,
                ':dayOfWeek' => $day->dayOfWeek
            ]);
        }
    }

    $conn->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Radno vreme je uspešno sačuvano i termini su ažurirani'
    ]);

} catch (Exception $e) {
    if ($conn->inTransaction()) {
        $conn->rollBack();
    }
    error_log("Greška: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>