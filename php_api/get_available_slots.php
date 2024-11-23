<?php
header('Access-Control-Allow-Origin: http://192.168.0.27:5173');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

try {
    $data = json_decode(file_get_contents("php://input"));
    
    // Dohvatamo trajanje usluge
    $serviceQuery = "SELECT trajanje FROM usluge WHERE id = ?";
    $stmt = $conn->prepare($serviceQuery);
    $stmt->execute([$data->serviceId]);
    $service = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$service) {
        throw new Exception('Usluga nije pronađena');
    }
    
    $serviceDuration = $service['trajanje'];
    $requiredSlots = ceil($serviceDuration / 15);
    
    // Dohvatamo radno vreme za taj dan
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

    // Dohvatamo sve slobodne slotove za taj dan u okviru radnog vremena
    $availableSlotsQuery = "SELECT time_slot 
                           FROM time_slots 
                           WHERE salon_id = ? 
                           AND date = ? 
                           AND is_available = 1 
                           AND TIME(time_slot) >= TIME(?) 
                           AND TIME(time_slot) <= TIME(?) 
                           AND (TIME(time_slot) < TIME(?) 
                           OR TIME(time_slot) > TIME(?))
                           ORDER BY time_slot";
    
    $stmt = $conn->prepare($availableSlotsQuery);
    $stmt->execute([
        $data->salonId,
        $data->date,
        $workingHours['start_time'],
        $workingHours['end_time'],
        $workingHours['break_start'],
        $workingHours['break_end']
    ]);

    $allSlots = $stmt->fetchAll(PDO::FETCH_COLUMN);
    $validSlots = [];

    // Provera uzastopnih slotova
    for ($i = 0; $i <= count($allSlots) - $requiredSlots; $i++) {
        $consecutive = true;
        $currentSlotTime = strtotime($allSlots[$i]);
        
        // Provera da li je trenutni slot unutar radnog vremena
        $slotTime = date('H:i:s', $currentSlotTime);
        if ($slotTime < $workingHours['start_time'] || $slotTime > $workingHours['end_time']) {
            continue;
        }
        
        // Provera da li su svi potrebni slotovi dostupni i unutar radnog vremena
        for ($j = 1; $j < $requiredSlots; $j++) {
            if (!isset($allSlots[$i + $j])) {
                $consecutive = false;
                break;
            }
            
            $nextSlotTime = strtotime($allSlots[$i + $j]);
            
            // Provera da li je sledeći slot 15 minuta nakon prethodnog
            if ($nextSlotTime - $currentSlotTime !== 900) {
                $consecutive = false;
                break;
            }
            
            // Provera da li sledeći slot prelazi radno vreme ili ulazi u pauzu
            $nextTime = date('H:i:s', $nextSlotTime);
            if ($nextTime > $workingHours['end_time'] || 
                ($nextTime >= $workingHours['break_start'] && $nextTime <= $workingHours['break_end'])) {
                $consecutive = false;
                break;
            }
            
            $currentSlotTime = $nextSlotTime;
        }
        
        if ($consecutive) {
            $validSlots[] = $allSlots[$i];
        }
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