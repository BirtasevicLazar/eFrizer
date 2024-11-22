<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
header('Access-Control-Allow-Origin: http://192.168.0.29:5173');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

try {
    $input = file_get_contents("php://input");
    $data = json_decode($input);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Nevalidan JSON format');
    }
    
    if (!isset($data->salon_id)) {
        throw new Exception('Nedostaje salon_id');
    }
    
    if (!isset($data->working_hours) || !is_array($data->working_hours)) {
        throw new Exception('Nedostaje working_hours ili nije niz');
    }
    
    $conn->beginTransaction();

    // Ažuriramo radno vreme
    $deleteWorkingHours = "DELETE FROM working_hours WHERE salon_id = ?";
    $stmt = $conn->prepare($deleteWorkingHours);
    $stmt->execute([$data->salon_id]);
    
    $insertWorkingHours = "INSERT INTO working_hours 
                          (salon_id, day_of_week, start_time, end_time, 
                           is_working, break_start, break_end) 
                          VALUES (?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($insertWorkingHours);
    
    foreach ($data->working_hours as $day) {
        $stmt->execute([
            $data->salon_id,
            $day->day_of_week,
            $day->start_time . ':00',
            $day->end_time . ':00',
            $day->is_working ? 1 : 0,
            $day->break_start . ':00',
            $day->break_end . ':00'
        ]);
    }

    // Brišemo stare termine
    $deleteOldSlots = "DELETE FROM time_slots WHERE date < CURRENT_DATE AND salon_id = ?";
    $stmt = $conn->prepare($deleteOldSlots);
    $stmt->execute([$data->salon_id]);

    // Ažuriramo postojeće i dodajemo nove termine
    for ($i = 0; $i < 30; $i++) {
        $date = date('Y-m-d', strtotime("+$i days"));
        $dayOfWeek = date('N', strtotime($date));
        
        // Dohvatamo radno vreme za taj dan
        $workingHoursQuery = "SELECT * FROM working_hours 
                            WHERE salon_id = ? AND day_of_week = ?";
        $stmt = $conn->prepare($workingHoursQuery);
        $stmt->execute([$data->salon_id, $dayOfWeek]);
        $workingHours = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($workingHours) {
            // Brišemo termine van radnog vremena
            if (!$workingHours['is_working']) {
                $deleteSlots = "DELETE FROM time_slots 
                              WHERE salon_id = ? AND date = ?";
                $stmt = $conn->prepare($deleteSlots);
                $stmt->execute([$data->salon_id, $date]);
                continue;
            }

            // Brišemo termine van novog radnog vremena
            $deleteOutsideHours = "DELETE FROM time_slots 
                                 WHERE salon_id = ? 
                                 AND date = ? 
                                 AND (time_slot < ? 
                                 OR time_slot > ? 
                                 OR (time_slot BETWEEN ? AND ?))";
            $stmt = $conn->prepare($deleteOutsideHours);
            $stmt->execute([
                $data->salon_id,
                $date,
                $workingHours['start_time'],
                $workingHours['end_time'],
                $workingHours['break_start'],
                $workingHours['break_end']
            ]);

            // Dodajemo termine pre pauze
            $startTime = strtotime($workingHours['start_time']);
            $breakStart = strtotime($workingHours['break_start']);
            
            while ($startTime < $breakStart) {
                $timeSlot = date('H:i:s', $startTime);
                
                // Proveravamo da li slot već postoji
                $checkSlot = "SELECT id FROM time_slots 
                            WHERE salon_id = ? AND date = ? AND time_slot = ?";
                $stmt = $conn->prepare($checkSlot);
                $stmt->execute([$data->salon_id, $date, $timeSlot]);
                
                if (!$stmt->fetch()) {
                    $insertSlot = "INSERT INTO time_slots 
                                 (salon_id, date, time_slot, is_available) 
                                 VALUES (?, ?, ?, 1)";
                    $stmt = $conn->prepare($insertSlot);
                    $stmt->execute([$data->salon_id, $date, $timeSlot]);
                }
                
                $startTime += 900;
            }

            // Dodajemo termine posle pauze
            $startTime = strtotime($workingHours['break_end']);
            $endTime = strtotime($workingHours['end_time']);
            
            while ($startTime < $endTime) {
                $timeSlot = date('H:i:s', $startTime);
                
                $checkSlot = "SELECT id FROM time_slots 
                            WHERE salon_id = ? AND date = ? AND time_slot = ?";
                $stmt = $conn->prepare($checkSlot);
                $stmt->execute([$data->salon_id, $date, $timeSlot]);
                
                if (!$stmt->fetch()) {
                    $insertSlot = "INSERT INTO time_slots 
                                 (salon_id, date, time_slot, is_available) 
                                 VALUES (?, ?, ?, 1)";
                    $stmt = $conn->prepare($insertSlot);
                    $stmt->execute([$data->salon_id, $date, $timeSlot]);
                }
                
                $startTime += 900;
            }
        }
    }

    $conn->commit();
    echo json_encode(['success' => true, 'message' => 'Radno vreme je uspešno ažurirano']);

} catch(Exception $e) {
    $conn->rollBack();
    error_log($e->getMessage());
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>