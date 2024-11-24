<?php
require_once 'config.php';

try {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!isset($data->appointmentId) || !isset($data->status)) {
        throw new Exception('Nedostaju potrebni podaci');
    }

    $query = "UPDATE appointments SET status = ? WHERE id = ?";
    $stmt = $conn->prepare($query);
    $stmt->execute([$data->status, $data->appointmentId]);

    echo json_encode([
        'success' => true,
        'message' => 'Status termina je uspešno ažuriran'
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?> 