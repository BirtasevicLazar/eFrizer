<?php
require_once 'cors.php'; 
require_once 'config.php';

// Handling preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}


try {
    $data = json_decode(file_get_contents("php://input"));

    if (!isset($data->barberId) || !isset($data->salonId) || !isset($data->name) || 
        !isset($data->duration) || !isset($data->price)) {
        throw new Exception('Sva polja su obavezna');
    }

    $query = "INSERT INTO usluge (salon_id, frizer_id, naziv_usluge, trajanje, cena, opis, valuta) 
              VALUES (:salonId, :barberId, :name, :duration, :price, :description, 'RSD')";
    
    $stmt = $conn->prepare($query);
    
    $stmt->bindParam(':salonId', $data->salonId);
    $stmt->bindParam(':barberId', $data->barberId);
    $stmt->bindParam(':name', $data->name);
    $stmt->bindParam(':duration', $data->duration);
    $stmt->bindParam(':price', $data->price);
    $stmt->bindParam(':description', $data->description);

    if($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Usluga uspešno dodata'
        ]);
    }
} catch(Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?> 