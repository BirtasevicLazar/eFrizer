<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);

header('Access-Control-Allow-Origin: http://192.168.0.25:5173');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config.php';

try {
    $input = file_get_contents("php://input");
    $data = json_decode($input);
    
    if (!isset($data->salon_id) || !isset($data->working_hours)) {
        throw new Exception('Nedostaju potrebni podaci');
    }
    
    // Prvo brišemo postojeće radno vreme za salon
    $query = "DELETE FROM working_hours WHERE salon_id = :salon_id";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':salon_id', $data->salon_id, PDO::PARAM_INT);
    $stmt->execute();
    
    // Zatim dodajemo novo radno vreme
    $query = "INSERT INTO working_hours (salon_id, day_of_week, start_time, end_time, is_working, break_start, break_end) 
              VALUES (:salon_id, :day_of_week, :start_time, :end_time, :is_working, :break_start, :break_end)";
    $stmt = $conn->prepare($query);
    
    foreach ($data->working_hours as $day) {
        $stmt->bindParam(':salon_id', $data->salon_id, PDO::PARAM_INT);
        $stmt->bindParam(':day_of_week', $day->day_of_week, PDO::PARAM_INT);
        $stmt->bindParam(':start_time', $day->start_time);
        $stmt->bindParam(':end_time', $day->end_time);
        $stmt->bindParam(':is_working', $day->is_working, PDO::PARAM_BOOL);
        $stmt->bindParam(':break_start', $day->break_start);
        $stmt->bindParam(':break_end', $day->break_end);
        $stmt->execute();
    }
    
    echo json_encode(['success' => true]);
    
} catch(Exception $e) {
    error_log($e->getMessage());
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
} catch(PDOException $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Greška baze podataka']);
}
?>