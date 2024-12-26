<?php
require_once 'cors.php'; 
require_once 'config.php';

$data = json_decode(file_get_contents("php://input"));

if(!isset($data->salonId)) {
    echo json_encode(array('success' => false, 'error' => 'Nije prosleđen ID salona'));
    exit();
}

try {
    $query = "SELECT id, ime, prezime, telefon, email 
              FROM frizeri 
              WHERE salon_id = ?";
    
    $stmt = $conn->prepare($query);
    $stmt->execute([$data->salonId]);
    
    $barbers = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (empty($barbers)) {
        echo json_encode(array(
            'success' => true,
            'barbers' => [],
            'debug' => array(
                'salonId' => $data->salonId,
                'message' => 'Nema frizera za ovaj salon'
            )
        ));
    } else {
        echo json_encode(array(
            'success' => true,
            'barbers' => $barbers
        ));
    }
} catch(PDOException $e) {
    echo json_encode(array(
        'success' => false, 
        'error' => $e->getMessage(),
        'debug' => array(
            'salonId' => $data->salonId,
            'sql_error' => $e->getMessage()
        )
    ));
}
?>