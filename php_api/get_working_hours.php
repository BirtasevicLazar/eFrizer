<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
header('Access-Control-Allow-Origin: http://192.168.0.27:5173');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

try {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!isset($data->salon_id)) {
        throw new Exception('Nije prosleđen ID salona');
    }

    $query = "SELECT * FROM working_hours WHERE salon_id = ? ORDER BY day_of_week";
    $stmt = $conn->prepare($query);
    $stmt->execute([$data->salon_id]);
    $workingHours = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Formatiramo vreme (uklanjamo sekunde)
    foreach ($workingHours as &$day) {
        $day['start_time'] = substr($day['start_time'], 0, 5);
        $day['end_time'] = substr($day['end_time'], 0, 5);
        $day['break_start'] = substr($day['break_start'], 0, 5);
        $day['break_end'] = substr($day['break_end'], 0, 5);
        $day['is_working'] = (bool)$day['is_working'];
    }

    echo json_encode([
        'success' => true,
        'working_hours' => $workingHours
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>