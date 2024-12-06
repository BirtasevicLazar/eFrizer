<?php
header('Access-Control-Allow-Origin: http://192.168.0.31:5173');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

// Handling preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config.php';

try {
    $data = json_decode(file_get_contents("php://input"));

    if (!isset($data->barberId) || !isset($data->salonId)) {
        throw new Exception('Nedostaju potrebni podaci');
    }

    $query = "SELECT * FROM usluge 
              WHERE salon_id = :salonId 
              AND frizer_id = :barberId";
              
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':salonId', $data->salonId);
    $stmt->bindParam(':barberId', $data->barberId);
    $stmt->execute();

    $services = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'services' => $services
    ]);
} catch(Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?> 