<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Access-Control-Allow-Origin: http://192.168.0.29:5173');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

try {
    $input = file_get_contents("php://input");
    $data = json_decode($input);
    
    if (!isset($data->salon_id)) {
        throw new Exception('Nedostaje ID salona');
    }
    
    $query = "SELECT * FROM working_hours WHERE salon_id = :salon_id ORDER BY day_of_week";
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':salon_id', $data->salon_id, PDO::PARAM_INT);
    $stmt->execute();
    
    $working_hours = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($working_hours)) {
        $default_hours = [
            ['day_of_week' => 1, 'name' => 'Ponedeljak', 'start_time' => '09:00', 'end_time' => '17:00', 'is_working' => true],
            ['day_of_week' => 2, 'name' => 'Utorak', 'start_time' => '09:00', 'end_time' => '17:00', 'is_working' => true],
            ['day_of_week' => 3, 'name' => 'Sreda', 'start_time' => '09:00', 'end_time' => '17:00', 'is_working' => true],
            ['day_of_week' => 4, 'name' => 'Četvrtak', 'start_time' => '09:00', 'end_time' => '17:00', 'is_working' => true],
            ['day_of_week' => 5, 'name' => 'Petak', 'start_time' => '09:00', 'end_time' => '17:00', 'is_working' => true],
            ['day_of_week' => 6, 'name' => 'Subota', 'start_time' => '09:00', 'end_time' => '15:00', 'is_working' => true],
            ['day_of_week' => 0, 'name' => 'Nedelja', 'start_time' => '09:00', 'end_time' => '17:00', 'is_working' => false]
        ];
        echo json_encode(['success' => true, 'working_hours' => $default_hours]);
        exit();
    }
    
    echo json_encode(['success' => true, 'working_hours' => $working_hours]);
    
} catch(Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
} catch(PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Greška baze podataka']);
}
?>