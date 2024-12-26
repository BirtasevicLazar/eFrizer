<?php
require_once 'cors.php'; 
require_once 'config.php';

try {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!isset($data->slug)) {
        throw new Exception('Nedostaje slug salona');
    }
    
    $query = "SELECT id, salon_naziv as salonName, vlasnik_ime as ownerName, 
              email, telefon as phone, adresa as address, grad as city 
              FROM saloni 
              WHERE slug = :slug AND aktivan = 1";
              
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':slug', $data->slug);
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
?> 