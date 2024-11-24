<?php
require_once 'config.php';

try {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!isset($data->salonId)) {
        throw new Exception('Nije prosleđen ID salona');
    }

    $query = "SELECT a.*, u.naziv_usluge as service_name, 
              DATE_FORMAT(a.date, '%Y-%m-%d') as formatted_date,
              TIME_FORMAT(a.time_slot, '%H:%i') as formatted_time
              FROM appointments a 
              JOIN usluge u ON a.service_id = u.id 
              WHERE a.salon_id = ? 
              ORDER BY a.date DESC, a.time_slot DESC";
              
    $stmt = $conn->prepare($query);
    $stmt->execute([$data->salonId]);
    $appointments = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'appointments' => $appointments
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>