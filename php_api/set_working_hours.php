<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
header('Access-Control-Allow-Origin: http://192.168.0.31:5173');
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
                           is_working, break_start, break_end, has_break) 
                          VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($insertWorkingHours);
    
    foreach ($data->working_hours as $day) {
        $stmt->execute([
            $data->salon_id,
            $day->day_of_week,
            $day->start_time . ':00',
            $day->end_time . ':00',
            $day->is_working ? 1 : 0,
            $day->break_start . ':00',
            $day->break_end . ':00',
            $day->has_break ? 1 : 0
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
            if (!$workingHours['is_working']) {
                continue;
            }

            // Brišemo postojeće slotove
            $deleteExistingSlots = "DELETE FROM time_slots WHERE salon_id = ? AND date = ?";
            $stmt = $conn->prepare($deleteExistingSlots);
            $stmt->execute([$data->salon_id, $date]);

            $startTime = strtotime($workingHours['start_time']);
            $endTime = strtotime($workingHours['end_time']);
            $currentTime = $startTime;

            if ($workingHours['has_break']) {
                $breakStart = strtotime($workingHours['break_start']);
                $breakEnd = strtotime($workingHours['break_end']);
                
                // Generišemo slotove pre pauze
                while ($currentTime < $breakStart && $currentTime < $endTime) {
                    $timeSlot = date('H:i:s', $currentTime);
                    // Insert slot
                    $insertSlot = "INSERT INTO time_slots (salon_id, date, time_slot, is_available) 
                                  VALUES (?, ?, ?, 1)";
                    $stmt = $conn->prepare($insertSlot);
                    $stmt->execute([$data->salon_id, $date, $timeSlot]);
                    $currentTime += 900;
                }

                // Generišemo slotove posle pauze
                $currentTime = $breakEnd;
                while ($currentTime < $endTime) {
                    $timeSlot = date('H:i:s', $currentTime);
                    // Insert slot
                    $insertSlot = "INSERT INTO time_slots (salon_id, date, time_slot, is_available) 
                                  VALUES (?, ?, ?, 1)";
                    $stmt = $conn->prepare($insertSlot);
                    $stmt->execute([$data->salon_id, $date, $timeSlot]);
                    $currentTime += 900;
                }
            } else {
                // Ako nema pauze, generišemo sve slotove od početka do kraja
                while ($currentTime < $endTime) {
                    $timeSlot = date('H:i:s', $currentTime);
                    // Insert slot
                    $insertSlot = "INSERT INTO time_slots (salon_id, date, time_slot, is_available) 
                                  VALUES (?, ?, ?, 1)";
                    $stmt = $conn->prepare($insertSlot);
                    $stmt->execute([$data->salon_id, $date, $timeSlot]);
                    $currentTime += 900;
                }
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