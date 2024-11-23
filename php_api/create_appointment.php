<?php
header('Access-Control-Allow-Origin: http://192.168.0.27:5173');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

try {
    $data = json_decode(file_get_contents("php://input"));
    
    // Provera podataka o terminu
    if (!isset($data->salonId) || !isset($data->serviceId) || 
        !isset($data->date) || !isset($data->timeSlot)) {
        throw new Exception('Nedostaju podaci o terminu');
    }

    // Provera korisničkih podataka samo ako su poslati
    if (isset($data->customerData)) {
        if (empty($data->customerData->name) || 
            empty($data->customerData->phone) || 
            empty($data->customerData->email)) {
            throw new Exception('Molimo popunite sve podatke o korisniku');
        }
    }

    $conn->beginTransaction();
    
    // Provera dostupnosti slotova
    $serviceQuery = "SELECT trajanje FROM usluge WHERE id = ?";
    $stmt = $conn->prepare($serviceQuery);
    $stmt->execute([$data->serviceId]);
    $service = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$service) {
        throw new Exception('Izabrana usluga nije pronađena');
    }
    
    $requiredSlots = ceil($service['trajanje'] / 15);

    // Provera dostupnosti termina
    $checkSlotsQuery = "SELECT COUNT(*) FROM time_slots 
                       WHERE salon_id = ? 
                       AND date = ? 
                       AND time_slot >= ? 
                       AND time_slot < ADDTIME(?, ?) 
                       AND is_available = 1";
    
    $stmt = $conn->prepare($checkSlotsQuery);
    $stmt->execute([
        $data->salonId, 
        $data->date, 
        $data->timeSlot,
        $data->timeSlot,
        date('H:i:s', $service['trajanje'] * 60)
    ]);
    $availableCount = $stmt->fetchColumn();

    if ($availableCount < $requiredSlots) {
        throw new Exception('Izabrani termini više nisu dostupni');
    }

    // Tek nakon provera kreiramo appointment
    $createAppointment = "INSERT INTO appointments 
                         (salon_id, service_id, date, time_slot, 
                          customer_name, customer_phone, customer_email, status) 
                         VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')";
    
    $stmt = $conn->prepare($createAppointment);
    $stmt->execute([
        $data->salonId,
        $data->serviceId,
        $data->date,
        $data->timeSlot,
        $data->customerData->name,
        $data->customerData->phone,
        $data->customerData->email
    ]);
    
    $appointmentId = $conn->lastInsertId();

    // Zauzimanje slotova
    $updateSlots = "UPDATE time_slots 
                   SET is_available = 0, 
                       appointment_id = ? 
                   WHERE salon_id = ? 
                   AND date = ? 
                   AND time_slot >= ? 
                   AND time_slot < ADDTIME(?, ?) 
                   AND is_available = 1";

    $stmt = $conn->prepare($updateSlots);
    $stmt->execute([
        $appointmentId,
        $data->salonId,
        $data->date,
        $data->timeSlot,
        $data->timeSlot,
        date('H:i:s', $service['trajanje'] * 60)
    ]);

    $conn->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Termin je uspešno zakazan',
        'appointmentId' => $appointmentId
    ]);

} catch(Exception $e) {
    $conn->rollBack();
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
} 