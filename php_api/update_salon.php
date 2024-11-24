<?php
header('Access-Control-Allow-Origin: http://192.168.0.27:5173');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config.php';

try {
    $data = json_decode(file_get_contents("php://input"));

    if (!isset($data->id)) {
        throw new Exception('Nije prosleđen ID salona');
    }

    // Validacija
    if (empty($data->salonName) || empty($data->ownerName) || 
        empty($data->address) || empty($data->city)) {
        throw new Exception('Sva polja moraju biti popunjena');
    }

    $query = "UPDATE saloni SET 
              salon_naziv = :salon_naziv,
              vlasnik_ime = :vlasnik_ime,
              adresa = :adresa,
              grad = :grad
              WHERE id = :id AND aktivan = 1";

    $stmt = $conn->prepare($query);

    $stmt->bindParam(':salon_naziv', $data->salonName);
    $stmt->bindParam(':vlasnik_ime', $data->ownerName);
    $stmt->bindParam(':adresa', $data->address);
    $stmt->bindParam(':grad', $data->city);
    $stmt->bindParam(':id', $data->id);

    if ($stmt->execute()) {
        // Dohvatamo ažurirane podatke - DODAJEMO ID u SELECT
        $selectQuery = "SELECT id, salon_naziv as salonName, vlasnik_ime as ownerName, 
                       email, telefon as phone, adresa as address, grad as city 
                       FROM saloni WHERE id = :id";
        $selectStmt = $conn->prepare($selectQuery);
        $selectStmt->bindParam(':id', $data->id);
        $selectStmt->execute();
        $updatedSalon = $selectStmt->fetch(PDO::FETCH_ASSOC);

        if (!$updatedSalon) {
            throw new Exception('Salon nije pronađen nakon ažuriranja');
        }

        echo json_encode([
            'success' => true,
            'message' => 'Podaci uspešno ažurirani',
            'salonData' => $updatedSalon
        ]);
    } else {
        throw new Exception('Greška pri ažuriranju podataka');
    }

} catch(Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>