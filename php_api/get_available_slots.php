<?php
header('Access-Control-Allow-Origin: http://192.168.0.28:5173');
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

    // Dohvatanje svih zauzetih termina
    $busySlotsQuery = "SELECT time_slot 
                      FROM time_slots 
                      WHERE salon_id = ? 
                      AND date = ? 
                      AND is_available = 0";
    
    $stmt = $conn->prepare($busySlotsQuery);
    $stmt->execute([$data->salonId, $data->date]);
    $busySlots = $stmt->fetchAll(PDO::FETCH_COLUMN);

    // Konvertovanje vremena
    $workStart = strtotime($workingHours['start_time']);
    $workEnd = strtotime($workingHours['end_time']);
    $breakStart = $workingHours['has_break'] ? strtotime($workingHours['break_start']) : null;
    $breakEnd = $workingHours['has_break'] ? strtotime($workingHours['break_end']) : null;

    // Generisanje dostupnih termina
    $availableSlots = [];
    $currentTime = $workStart;
    $serviceDurationSeconds = $serviceDuration * 60;

    while ($currentTime + $serviceDurationSeconds <= $workEnd) {
        $endTime = $currentTime + $serviceDurationSeconds;
        $isValid = true;

        // Provera pauze
        if ($breakStart && $breakEnd) {
            if (($currentTime < $breakStart && $endTime > $breakStart) || 
                ($currentTime >= $breakStart && $currentTime < $breakEnd)) {
                $currentTime = $breakEnd;
                continue;
            }
        }

        // Provera zauzetih termina
        $timeSlot = date('H:i:s', $currentTime);
        foreach ($busySlots as $busySlot) {
            $busyTime = strtotime($busySlot);
            if ($currentTime < $busyTime + 900 && $endTime > $busyTime) {
                $isValid = false;
                break;
            }
        }

        if ($isValid) {
            $availableSlots[] = $timeSlot;
        }

        // Pomeranje na sledeći termin baziran na trajanju usluge
        $currentTime += $serviceDurationSeconds;
    }

    echo json_encode([
        'success' => true,
        'slots' => $availableSlots,
        'serviceDuration' => $serviceDuration
    ]);

} catch(Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}