<?php
header('Access-Control-Allow-Origin: http://192.168.0.29:5173');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

try {
    $data = json_decode(file_get_contents("php://input"));
    
    // Provera radnog vremena za taj dan
    $dayOfWeek = date('N', strtotime($data->date));
    $workingHoursQuery = "SELECT * FROM working_hours 
                         WHERE salon_id = ? AND day_of_week = ?";
    $stmt = $conn->prepare($workingHoursQuery);
    $stmt->execute([$data->salonId, $dayOfWeek]);
    $workingHours = $stmt->fetch(PDO::FETCH_ASSOC);

    // Provera da li je dan neradan
    if (!$workingHours || !$workingHours['is_working']) {
        echo json_encode([
            'success' => true,
            'slots' => [],
            'workingHours' => $workingHours,
            'message' => 'Salon ne radi u izabrani dan'
        ]);
        exit();
    }

    // Dohvati slobodne termine koji su u okviru radnog vremena
    $availableSlotsQuery = "SELECT time_slot 
                           FROM time_slots 
                           WHERE salon_id = ? 
                           AND date = ? 
                           AND time_slot >= ? 
                           AND time_slot <= ? 
                           AND time_slot NOT BETWEEN ? AND ?
                           AND is_available = 1 
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

    $availableSlots = $stmt->fetchAll(PDO::FETCH_COLUMN);

    echo json_encode([
        'success' => true,
        'slots' => $availableSlots,
        'workingHours' => $workingHours
    ]);

} catch(Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}