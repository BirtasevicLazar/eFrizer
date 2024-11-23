<?php
header('Access-Control-Allow-Origin: http://192.168.0.27:5173');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

try {
    $data = json_decode(file_get_contents("php://input"));
    
    // Dohvatanje trajanja usluge
    $serviceQuery = "SELECT trajanje FROM usluge WHERE id = ?";
    $stmt = $conn->prepare($serviceQuery);
    $stmt->execute([$data->serviceId]);
    $service = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$service) {
        throw new Exception('Usluga nije pronađena');
    }
    
    $serviceDuration = $service['trajanje'];
    
    // Dohvatanje radnog vremena
    $dayOfWeek = date('N', strtotime($data->date));
    $workingHoursQuery = "SELECT * FROM working_hours WHERE salon_id = ? AND day_of_week = ?";
    $stmt = $conn->prepare($workingHoursQuery);
    $stmt->execute([$data->salonId, $dayOfWeek]);
    $workingHours = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$workingHours || !$workingHours['is_working']) {
        echo json_encode([
            'success' => true,
            'slots' => [],
            'message' => 'Salon ne radi u izabrani dan'
        ]);
        exit();
    }

    // Dohvatanje svih slobodnih slotova
    $availableSlotsQuery = "SELECT time_slot 
                           FROM time_slots 
                           WHERE salon_id = ? 
                           AND date = ? 
                           AND is_available = 1 
                           ORDER BY time_slot";
    
    $stmt = $conn->prepare($availableSlotsQuery);
    $stmt->execute([$data->salonId, $data->date]);
    $allSlots = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    // Додајте ово одмах након дохватања слотова
    if (empty($allSlots)) {
        echo json_encode([
            'success' => true,
            'slots' => [],
            'serviceDuration' => $serviceDuration
        ]);
        exit();
    }
    
    // Konvertovanje vremena
    $workStart = strtotime($workingHours['start_time']);
    $workEnd = strtotime($workingHours['end_time']);
    $breakStart = $workingHours['has_break'] ? strtotime($workingHours['break_start']) : null;
    $breakEnd = $workingHours['has_break'] ? strtotime($workingHours['break_end']) : null;

    // Pronalaženje dostupnih termina
    $validSlots = [];
    $interval = 15;
    $requiredSlots = ceil($serviceDuration / 15);
    $currentTime = $workStart;
    
    // И измените главну while петљу
    while ($currentTime <= $workEnd - ($serviceDuration * 60)) {
        $endTime = $currentTime + ($serviceDuration * 60);
        $isValid = true;
        
        // Провера да ли термин улази у паузу
        if ($breakStart && $breakEnd) {
            if (($currentTime < $breakStart && $endTime > $breakStart) || 
                ($currentTime >= $breakStart && $currentTime < $breakEnd)) {
                $currentTime = $breakEnd;
                continue;
            }
        }
        
        // Провера да ли прелази крај радног времена
        if ($endTime > $workEnd) {
            break;
        }
        
        // Провера узастопних слотова
        for ($i = 0; $i < $requiredSlots; $i++) {
            $slotToCheck = date('H:i:s', $currentTime + ($i * 15 * 60));
            if (!in_array($slotToCheck, $allSlots)) {
                $isValid = false;
                break;
            }
        }
        
        if ($isValid) {
            $validSlots[] = date('H:i:s', $currentTime);
        }
        
        $currentTime += ($interval * 60);
    }

    echo json_encode([
        'success' => true,
        'slots' => $validSlots,
        'serviceDuration' => $serviceDuration
    ]);

} catch(Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}