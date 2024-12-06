<?php
header('Access-Control-Allow-Origin: http://192.168.0.31:5173');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config.php';

try {
    $data = json_decode(file_get_contents("php://input"));

    if (!isset($data->serviceId) || !isset($data->salonId)) {
        throw new Exception('Nedostaju potrebni podaci');
    }

    // Proveravamo da li postoje zakazani termini
    $checkAppointments = "SELECT COUNT(*) as count FROM appointments 
                          WHERE service_id = :serviceId";
    
    $stmtCheck = $conn->prepare($checkAppointments);
    $stmtCheck->bindParam(':serviceId', $data->serviceId);
    $stmtCheck->execute();
    
    $result = $stmtCheck->fetch(PDO::FETCH_ASSOC);
    
    // Ako je samo provera i postoje termini
    if (isset($data->checkOnly) && $data->checkOnly && $result['count'] > 0) {
        echo json_encode([
            'success' => false,
            'hasAppointments' => true,
            'error' => 'Postoje zakazani termini povezani sa ovom uslugom. Da li ste sigurni da želite da obrišete uslugu i sve povezane termine?'
        ]);
        exit();
    }

    // Ako korisnik nije potvrdio brisanje termina
    if ($result['count'] > 0 && !isset($data->confirmed)) {
        echo json_encode([
            'success' => false,
            'hasAppointments' => true,
            'error' => 'Postoje zakazani termini povezani sa ovom uslugom.'
        ]);
        exit();
    }

    // Započinjemo transakciju
    $conn->beginTransaction();

    // Brišemo sve povezane appointmente
    $deleteAppointments = "DELETE FROM appointments 
                           WHERE service_id = :serviceId";
    
    $stmtApp = $conn->prepare($deleteAppointments);
    $stmtApp->bindParam(':serviceId', $data->serviceId);
    $stmtApp->execute();

    // Brišemo uslugu
    $deleteService = "DELETE FROM usluge 
                      WHERE id = :serviceId 
                      AND salon_id = :salonId";
    
    $stmtService = $conn->prepare($deleteService);
    $stmtService->bindParam(':serviceId', $data->serviceId);
    $stmtService->bindParam(':salonId', $data->salonId);
    $stmtService->execute();

    // Potvrđujemo transakciju
    $conn->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Usluga i svi povezani termini su uspešno obrisani'
    ]);

} catch(Exception $e) {
    // Ako dođe do greške, poništavamo transakciju
    if ($conn->inTransaction()) {
        $conn->rollBack();
    }
    
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?> 