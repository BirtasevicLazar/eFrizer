<?php
header('Access-Control-Allow-Origin: http://192.168.0.27:5173');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

try {
    $data = json_decode(file_get_contents("php://input"));
    
    $conn->beginTransaction();
    
    // Kreiranje appointment zapisa
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
    
    // Provera dostupnosti slotova
    $serviceQuery = "SELECT trajanje FROM usluge WHERE id = ?";
    $stmt = $conn->prepare($serviceQuery);
    $stmt->execute([$data->serviceId]);
    $service = $stmt->fetch(PDO::FETCH_ASSOC);
    $requiredSlots = ceil($service['trajanje'] / 15);

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

    // Dodati pre provere dostupnosti slotova
    $currentDateTime = date('Y-m-d H:i:s');
    $appointmentDateTime = $data->date . ' ' . $data->timeSlot;

    if (strtotime($appointmentDateTime) < strtotime($currentDateTime)) {
        throw new Exception('Ne možete zakazati termin u prošlosti');
    }

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