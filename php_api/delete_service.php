<?php
header('Access-Control-Allow-Origin: http://192.168.0.29:5173');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

require_once 'config.php';

$data = json_decode(file_get_contents("php://input"));

if(!isset($data->serviceId)) {
    echo json_encode(array('success' => false, 'error' => 'Nedostaje ID usluge'));
    exit();
}

try {
    $query = "DELETE FROM usluge WHERE id = ?";
    $stmt = $conn->prepare($query);
    $stmt->execute([$data->serviceId]);
    
    if($stmt->rowCount() > 0) {
        echo json_encode(array('success' => true));
    } else {
        echo json_encode(array('success' => false, 'error' => 'Usluga nije pronađena'));
    }
} catch(PDOException $e) {
    echo json_encode(array('success' => false, 'error' => $e->getMessage()));
}