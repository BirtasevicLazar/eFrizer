<?php
require_once 'cors.php'; 
require_once 'config.php';

$data = json_decode(file_get_contents("php://input"));

if(!isset($data->salonId) || !isset($data->barberId)) {
    echo json_encode(array('success' => false, 'error' => 'Nedostaju potrebni podaci'));
    exit();
}

try {
    $query = "SELECT * FROM usluge WHERE salon_id = ? AND frizer_id = ? ORDER BY naziv_usluge ASC";
    $stmt = $conn->prepare($query);
    $stmt->execute([$data->salonId, $data->barberId]);
    
    $services = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(array(
        'success' => true,
        'services' => $services
    ));
} catch(PDOException $e) {
    echo json_encode(array('success' => false, 'error' => $e->getMessage()));
}