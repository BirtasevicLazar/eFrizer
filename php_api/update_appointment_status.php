<?php
header('Access-Control-Allow-Origin: http://192.168.0.31:5173');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

require_once 'config.php';

try {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!isset($data->appointmentId) || !isset($data->status)) {
        throw new Exception('Nedostaju potrebni podaci');
    }

    $validStatuses = ['pending', 'completed', 'cancelled'];
    if (!in_array($data->status, $validStatuses)) {
        throw new Exception('Nevažeći status');
    }

    $stmt = $conn->prepare("
        UPDATE appointments 
        SET status = :status,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = :appointmentId
        AND frizer_id = :barberId
    ");

    $stmt->execute([
        ':status' => $data->status,
        ':appointmentId' => $data->appointmentId,
        ':barberId' => $data->barberId
    ]);

    // Dohvatanje ažuriranog termina
    $stmt = $conn->prepare("
        SELECT 
            a.*,
            u.naziv_usluge as service_name,
            u.trajanje as duration,
            k.ime as client_name,
            k.telefon as client_phone,
            k.email as client_email
        FROM appointments a
        LEFT JOIN usluge u ON a.service_id = u.id
        LEFT JOIN klijenti k ON a.client_id = k.id
        WHERE a.id = :appointmentId
    ");

    $stmt->execute([':appointmentId' => $data->appointmentId]);
    $updatedAppointment = $stmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'appointment' => $updatedAppointment,
        'message' => 'Status termina je uspešno ažuriran'
    ]);

} catch(Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?> 