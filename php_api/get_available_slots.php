<?php
header('Access-Control-Allow-Origin: http://192.168.0.31:5173');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

try {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!isset($data->barberId) || !isset($data->date) || !isset($data->salonId) || !isset($data->serviceId)) {
        throw new Exception('Nedostaju potrebni podaci');
    }

    // Provera da li je datum validan
    $selectedDate = new DateTime($data->date);
    $today = new DateTime(date('Y-m-d'));
    
    if ($selectedDate < $today) {
        throw new Exception('Ne možete zakazati termin za prošle datume');
    }

    // Dohvatamo radno vreme i pauzu
    $dayOfWeek = $selectedDate->format('N');
    
    $workingHoursStmt = $conn->prepare("
        SELECT start_time, end_time, has_break, break_start, break_end, is_working
        FROM working_hours 
        WHERE salon_id = :salonId 
        AND barber_id = :barberId 
        AND day_of_week = :dayOfWeek
    ");

    $workingHoursStmt->execute([
        ':salonId' => $data->salonId,
        ':barberId' => $data->barberId,
        ':dayOfWeek' => $dayOfWeek
    ]);

    $workingHours = $workingHoursStmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$workingHours || !$workingHours['is_working']) {
        echo json_encode([
            'success' => true,
            'slots' => [],
            'message' => 'Frizer ne radi ovog dana'
        ]);
        exit;
    }

    // Provera da li postoje generisani termini za taj dan
    $checkSlotsStmt = $conn->prepare("
        SELECT COUNT(*) 
        FROM time_slots 
        WHERE salon_id = :salonId 
        AND frizer_id = :barberId 
        AND date = :date
    ");

    $checkSlotsStmt->execute([
        ':salonId' => $data->salonId,
        ':barberId' => $data->barberId,
        ':date' => $data->date
    ]);

    if ($checkSlotsStmt->fetchColumn() == 0) {
        echo json_encode([
            'success' => true,
            'slots' => [],
            'message' => 'Termini još nisu generisani za izabrani datum'
        ]);
        exit;
    }

    // Dohvatamo trajanje usluge
    $serviceStmt = $conn->prepare("
        SELECT trajanje 
        FROM usluge 
        WHERE id = :serviceId AND salon_id = :salonId
    ");
    
    $serviceStmt->execute([
        ':serviceId' => $data->serviceId,
        ':salonId' => $data->salonId
    ]);
    
    $service = $serviceStmt->fetch(PDO::FETCH_ASSOC);
    $serviceDuration = $service['trajanje'];

    // Dohvatamo zauzete termine
    $busySlotsStmt = $conn->prepare("
        SELECT a.time_slot as start_time, 
               ADDTIME(a.time_slot, SEC_TO_TIME(u.trajanje * 60)) as end_time
        FROM appointments a
        JOIN usluge u ON a.service_id = u.id
        WHERE a.salon_id = :salonId 
        AND a.frizer_id = :barberId
        AND a.date = :date
        AND a.status != 'cancelled'
        ORDER BY a.time_slot ASC
    ");

    $busySlotsStmt->execute([
        ':salonId' => $data->salonId,
        ':barberId' => $data->barberId,
        ':date' => $data->date
    ]);
    
    $busySlots = $busySlotsStmt->fetchAll(PDO::FETCH_ASSOC);

    // Generišemo moguće termine
    $availableSlots = [];
    $currentTime = strtotime($workingHours['start_time']);
    $endTime = strtotime($workingHours['end_time']);
    $breakStart = $workingHours['has_break'] ? strtotime($workingHours['break_start']) : null;
    $breakEnd = $workingHours['has_break'] ? strtotime($workingHours['break_end']) : null;

    // Funkcija za proveru preklapanja
    function hasOverlap($start, $end, $busySlots) {
        foreach ($busySlots as $busy) {
            $busyStart = strtotime($busy['start_time']);
            $busyEnd = strtotime($busy['end_time']);
            if ($start < $busyEnd && $end > $busyStart) {
                return true;
            }
        }
        return false;
    }

    // Funkcija za proveru pauze
    function isInBreak($start, $end, $breakStart, $breakEnd) {
        if (!$breakStart || !$breakEnd) return false;
        return ($start < $breakEnd && $end > $breakStart);
    }

    // Funkcija za proveru dostupnog vremena do sledećeg zauzetog termina
    function getAvailableTimeUntilNext($currentTime, $busySlots, $breakStart, $endTime) {
        $nextTime = $endTime;
        
        foreach ($busySlots as $busy) {
            $busyStart = strtotime($busy['start_time']);
            if ($busyStart > $currentTime) {
                $nextTime = min($nextTime, $busyStart);
            }
        }
        
        if ($breakStart && $breakStart > $currentTime) {
            $nextTime = min($nextTime, $breakStart);
        }
        
        return $nextTime - $currentTime;
    }

    while ($currentTime < $endTime) {
        // Preskačemo pauzu
        if ($breakStart && $currentTime >= $breakStart && $currentTime < $breakEnd) {
            $currentTime = $breakEnd;
            continue;
        }

        // Računamo koliko vremena imamo do sledećeg zauzetog termina
        $availableTime = getAvailableTimeUntilNext($currentTime, $busySlots, $breakStart, $endTime);
        
        // Ako nemamo dovoljno vremena za trenutnu uslugu, pomeramo se na sledeći interval
        if ($availableTime < $serviceDuration * 60) {
            $currentTime += 1800; // 30 minuta
            continue;
        }

        $slotEndTime = $currentTime + ($serviceDuration * 60);
        
        // Provera da li je termin validan
        if (!hasOverlap($currentTime, $slotEndTime, $busySlots) && 
            !isInBreak($currentTime, $slotEndTime, $breakStart, $breakEnd) &&
            $slotEndTime <= $endTime) {
            
            $minutes = date('i', $currentTime);
            $isValidStartTime = true;

            // Pravila za različita trajanja
            if ($serviceDuration == 15) {
                // 15-minutni termini mogu početi na svakih 15 minuta
                $isValidStartTime = ($minutes == '00' || $minutes == '15' || 
                                   $minutes == '30' || $minutes == '45');
            } else {
                // Svi ostali termini počinju na pune sate ili pola sata
                $isValidStartTime = ($minutes == '00' || $minutes == '30');
            }

            if ($isValidStartTime) {
                $availableSlots[] = [
                    'start' => date('H:i', $currentTime),
                    'end' => date('H:i', $slotEndTime)
                ];
            }
        }

        // Pomeranje na sledeći interval
        if ($serviceDuration == 15) {
            $currentTime += 900; // 15 minuta
        } else {
            $currentTime += 1800; // 30 minuta
        }
    }

    echo json_encode([
        'success' => true,
        'slots' => $availableSlots
    ]);

} catch(Exception $e) {
    error_log("Greška: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}