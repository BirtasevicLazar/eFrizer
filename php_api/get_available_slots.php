<?php
header('Access-Control-Allow-Origin: http://192.168.0.29:5173');
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
    $requiredSlots = ceil($serviceDuration / 15); // Broj potrebnih 15-minutnih slotova
    
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

    // Dohvatamo sve slobodne slotove za taj dan
    $availableSlotsQuery = "SELECT time_slot 
                           FROM time_slots 
                           WHERE salon_id = ? 
                           AND date = ? 
                           AND is_available = 1 
                           AND time_slot >= ? 
                           AND time_slot <= ? 
                           AND time_slot NOT BETWEEN ? AND ?
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

    // Prolazimo kroz sve slotove i tražimo uzastopne
    for ($i = 0; $i <= count($allSlots) - $requiredSlots; $i++) {
        $consecutive = true;
        
        // Proveravamo da li imamo dovoljan broj uzastopnih slotova
        for ($j = 1; $j < $requiredSlots; $j++) {
            $currentSlot = strtotime($allSlots[$i + $j - 1]);
            $nextSlot = strtotime($allSlots[$i + $j]);
            
            // Proveravamo da li su slotovi uzastopni (razlika 15 minuta)
            if ($nextSlot - $currentSlot != 900) { // 900 sekundi = 15 minuta
                $consecutive = false;
                break;
            }
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