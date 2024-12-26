<?php
require_once 'cors.php'; 
require_once 'config.php';


if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}


try {
    $data = json_decode(file_get_contents("php://input"));

    if (!isset($data->serviceId) || !isset($data->barberId) || !isset($data->salonId) || 
        !isset($data->name) || !isset($data->duration) || !isset($data->price)) {
        throw new Exception('Sva polja su obavezna');
    }

    $query = "UPDATE usluge 
              SET naziv_usluge = :name,
                  trajanje = :duration,
                  cena = :price,
                  opis = :description
              WHERE id = :serviceId 
              AND frizer_id = :barberId 
              AND salon_id = :salonId";
    
    $stmt = $conn->prepare($query);
    
    $stmt->bindParam(':serviceId', $data->serviceId);
    $stmt->bindParam(':barberId', $data->barberId);
    $stmt->bindParam(':salonId', $data->salonId);
    $stmt->bindParam(':name', $data->name);
    $stmt->bindParam(':duration', $data->duration);
    $stmt->bindParam(':price', $data->price);
    $stmt->bindParam(':description', $data->description);

    if($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Usluga uspešno izmenjena'
        ]);
    }
} catch(Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?> 