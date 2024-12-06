<?php
header('Access-Control-Allow-Origin: http://192.168.0.31:5173');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');
header('Content-Type: application/json');

require_once 'config.php';

try {
    $data = json_decode(file_get_contents("php://input"));

    if (!isset($data->barberId) || !isset($data->salonId) || !isset($data->date)) {
        throw new Exception('Nedostaju potrebni podaci');
    }

    $query = "SELECT 
                a.*,
                u.naziv_usluge as service_name,
                u.trajanje as duration,
                k.ime as client_name,
                k.telefon as client_phone,
                k.email as client_email
              FROM appointments a
              LEFT JOIN usluge u ON a.service_id = u.id
              LEFT JOIN klijenti k ON a.client_id = k.id
              WHERE a.frizer_id = :barberId 
              AND a.salon_id = :salonId 
              AND DATE(a.date) = :date
              ORDER BY a.time_slot ASC";
              
    $stmt = $conn->prepare($query);
    $stmt->execute([
        ':barberId' => $data->barberId,
        ':salonId' => $data->salonId,
        ':date' => $data->date
    ]);

    $appointments = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'appointments' => $appointments
    ]);

} catch(Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?> 