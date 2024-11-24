<?php
require_once 'config.php';

try {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!isset($data->appointmentId) || !isset($data->status)) {
        throw new Exception('Nedostaju potrebni podaci');
    }

    $conn->beginTransaction();

    // Ažuriranje statusa
    $query = "UPDATE appointments SET status = ? WHERE id = ?";
    $stmt = $conn->prepare($query);
    $stmt->execute([$data->status, $data->appointmentId]);

    // Dohvatanje svih termina za taj dan
    $appointmentQuery = "SELECT a.*, u.naziv_usluge as service_name, 
                        u.trajanje as duration,
                        DATE_FORMAT(a.date, '%Y-%m-%d') as formatted_date
                        FROM appointments a 
                        JOIN usluge u ON a.service_id = u.id 
                        WHERE a.salon_id = ? AND a.date = ?
                        ORDER BY a.time_slot ASC";
                        
    $stmt = $conn->prepare($appointmentQuery);
    $stmt->execute([$data->salonId, $data->date]);
    $appointments = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $conn->commit();
    
    echo json_encode([
        'success' => true,
        'appointments' => $appointments
    ]);

} catch(Exception $e) {
    $conn->rollBack();
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?> 