<?php
require_once 'cors.php'; 
require_once 'config.php';

try {
    $data = json_decode(file_get_contents("php://input"));

    if (!isset($data->salonId)) {
        throw new Exception('Nedostaje ID salona');
    }

    // Provera da li postoji salon sa istim emailom
    $checkQuery = "SELECT id FROM saloni WHERE email = :email AND id != :salonId";
    $checkStmt = $conn->prepare($checkQuery);
    $checkStmt->bindParam(':email', $data->email);
    $checkStmt->bindParam(':salonId', $data->salonId);
    $checkStmt->execute();

    if ($checkStmt->rowCount() > 0) {
        throw new Exception('Email adresa je već u upotrebi');
    }

    $query = "UPDATE saloni SET 
              salon_naziv = :salonName,
              vlasnik_ime = :ownerName,
              email = :email,
              telefon = :phone,
              adresa = :address,
              grad = :city
              WHERE id = :salonId AND aktivan = 1";
    
    $stmt = $conn->prepare($query);
    
    $stmt->bindParam(':salonId', $data->salonId);
    $stmt->bindParam(':salonName', $data->salonName);
    $stmt->bindParam(':ownerName', $data->ownerName);
    $stmt->bindParam(':email', $data->email);
    $stmt->bindParam(':phone', $data->phone);
    $stmt->bindParam(':address', $data->address);
    $stmt->bindParam(':city', $data->city);

    if($stmt->execute()) {
        // Dohvatanje ažuriranih podataka
        $selectQuery = "SELECT id, salon_naziv as salonName, vlasnik_ime as ownerName, 
                       email, telefon as phone, adresa as address, grad as city, slug 
                       FROM saloni 
                       WHERE id = :salonId AND aktivan = 1";
        $selectStmt = $conn->prepare($selectQuery);
        $selectStmt->bindParam(':salonId', $data->salonId);
        $selectStmt->execute();
        
        $updatedSalon = $selectStmt->fetch(PDO::FETCH_ASSOC);

        echo json_encode([
            'success' => true,
            'message' => 'Podaci salona su uspešno ažurirani',
            'salon' => $updatedSalon
        ]);
    }
} catch(Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>