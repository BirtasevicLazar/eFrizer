<?php
require_once 'config.php';

try {
    $data = json_decode(file_get_contents("php://input"));
    
    if (!isset($data->salonId) || !isset($data->date)) {
        throw new Exception('Nisu prosleđeni svi potrebni podaci');
    }

    $query = "SELECT 
                a.*, 
                u.naziv_usluge as service_name,
                u.trajanje as duration,
                u.cena as price,
                u.valuta as currency,
                DATE_FORMAT(a.date, '%Y-%m-%d') as formatted_date,
                TIME_FORMAT(a.time_slot, '%H:%i') as formatted_time,
                a.customer_name,
                a.customer_phone,
                a.customer_email
              FROM appointments a 
              JOIN usluge u ON a.service_id = u.id 
              WHERE a.salon_id = ? 
              AND a.date = ?
              ORDER BY a.time_slot ASC";
              
    $stmt = $conn->prepare($query);
    $stmt->execute([$data->salonId, $data->date]);
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