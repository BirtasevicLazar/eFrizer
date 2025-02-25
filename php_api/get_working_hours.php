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
    if (!$data || !isset($data->barberId) || !isset($data->salonId)) {
        throw new Exception('Nedostaju potrebni podaci');
    }

    $stmt = $conn->prepare("
        SELECT 
            day_of_week as dayOfWeek,
            is_working as isWorking,
            TIME_FORMAT(start_time, '%H:%i') as startTime,
            TIME_FORMAT(end_time, '%H:%i') as endTime,
            has_break as hasBreak,
            TIME_FORMAT(break_start, '%H:%i') as breakStart,
            TIME_FORMAT(break_end, '%H:%i') as breakEnd
        FROM working_hours 
        WHERE barber_id = :barberId AND salon_id = :salonId
        ORDER BY day_of_week ASC
    ");

    $stmt->execute([
        ':barberId' => (int)$data->barberId,
        ':salonId' => (int)$data->salonId
    ]);

    $workingHours = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'workingHours' => $workingHours
    ]);

} catch (Exception $e) {
    error_log("Greška: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>