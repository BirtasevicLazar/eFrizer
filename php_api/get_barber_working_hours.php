<?php
header('Access-Control-Allow-Origin: http://192.168.0.31:5173');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

require_once 'config.php';

try {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!isset($data->barberId) || !isset($data->salonId)) {
        throw new Exception('Nisu prosleđeni svi potrebni podaci');
    }

    $stmt = $conn->prepare("
        SELECT 
            day_of_week,
            is_working,
            TIME_FORMAT(start_time, '%H:%i') as start_time,
            TIME_FORMAT(end_time, '%H:%i') as end_time,
            has_break,
            TIME_FORMAT(break_start, '%H:%i') as break_start,
            TIME_FORMAT(break_end, '%H:%i') as break_end
        FROM working_hours 
        WHERE barber_id = :barberId 
        AND salon_id = :salonId
        ORDER BY day_of_week ASC
    ");

    $stmt->execute([
        ':barberId' => $data->barberId,
        ':salonId' => $data->salonId
    ]);

    $workingHours = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'workingHours' => $workingHours
    ]);

} catch(Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>