<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
header('Access-Control-Allow-Origin: http://192.168.0.31:5173');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

require_once 'config.php';

try {
    $data = json_decode(file_get_contents("php://input"));

    if (!isset($data->salonId) || !isset($data->ime) || !isset($data->prezime) || !isset($data->email) || !isset($data->telefon)) {
        throw new Exception('Sva polja su obavezna');
    }

    $query = "INSERT INTO frizeri (salon_id, ime, prezime, email, telefon) 
              VALUES (:salon_id, :ime, :prezime, :email, :telefon)";
    
    $stmt = $conn->prepare($query);
    
    $stmt->bindParam(':salon_id', $data->salonId);
    $stmt->bindParam(':ime', $data->ime);
    $stmt->bindParam(':prezime', $data->prezime);
    $stmt->bindParam(':email', $data->email);
    $stmt->bindParam(':telefon', $data->telefon);

    if($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Frizer uspešno dodat'
        ]);
    }
} catch(Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>