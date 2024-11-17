<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

require_once 'config.php';

$data = json_decode(file_get_contents("php://input"));

if(!isset($data->salonId)) {
    echo json_encode(array('success' => false, 'error' => 'Nedostaje ID salona'));
    exit();
}

try {
    $query = "SELECT * FROM usluge WHERE salon_id = ? ORDER BY naziv_usluge ASC";
    $stmt = $conn->prepare($query);
    $stmt->execute([$data->salonId]);
    
    $services = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(array(
        'success' => true,
        'services' => $services
    ));
} catch(PDOException $e) {
    echo json_encode(array('success' => false, 'error' => $e->getMessage()));
}