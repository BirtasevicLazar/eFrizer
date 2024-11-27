<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
header('Access-Control-Allow-Origin: http://192.168.0.31:5173');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

require_once 'config.php';

try {
    // Provera POST podataka
    $input = file_get_contents("php://input");
    if (empty($input)) {
        throw new Exception('Nema ulaznih podataka');
    }

    $data = json_decode($input);
    if (!isset($data->salonId)) {
        throw new Exception('Nije prosleđen ID salona');
    }

    // Izmenjen SQL upit bez slug kolone
    $query = "SELECT id, salon_naziv as salonName, vlasnik_ime as ownerName, 
              email, telefon as phone, adresa as address, grad as city, slug 
              FROM saloni 
              WHERE id = :salonId AND aktivan = 1";
              
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':salonId', $data->salonId);
    $stmt->execute();

    if ($salon = $stmt->fetch(PDO::FETCH_ASSOC)) {
        echo json_encode([
            'success' => true,
            'salon' => $salon
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'Salon nije pronađen'
        ]);
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}