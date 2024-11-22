<?php
header('Access-Control-Allow-Origin: http://192.168.0.29:5173');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'config.php';

try {
    $data = json_decode(file_get_contents("php://input"));
    
    $conn->beginTransaction();

    // Provera da li su slotovi i dalje slobodni
    $timeSlot = $data->timeSlot;
    $serviceQuery = "SELECT trajanje FROM usluge WHERE id = ?";
    $stmt = $conn->prepare($serviceQuery);
    $stmt->execute([$data->serviceId]);
    $service = $stmt->fetch(PDO::FETCH_ASSOC);
    $requiredSlots = ceil($service['trajanje'] / 15);

    // Proveri dostupnost svih potrebnih slotova
    $checkSlotsQuery = "SELECT COUNT(*) FROM time_slots 
                       WHERE salon_id = ? 
                       AND date = ? 
                       AND time_slot >= ? 
                       AND is_available = 1 
                       LIMIT ?";
    $stmt = $conn->prepare($checkSlotsQuery);
    $stmt->execute([$data->salonId, $data->date, $timeSlot, $requiredSlots]);
    $availableCount = $stmt->fetchColumn();

    if ($availableCount < $requiredSlots) {
        throw new Exception('Izabrani termini više nisu dostupni');
    }

    // Zauzmi potrebne slotove
    $updateSlotsQuery = "UPDATE time_slots 
                        SET is_available = 0, 
                            appointment_id = ? 
                        WHERE salon_id = ? 
                        AND date = ? 
                        AND time_slot >= ? 
                        AND is_available = 1 
                        LIMIT ?";
    
    $stmt = $conn->prepare($updateSlotsQuery);
    $stmt->execute([
        $appointmentId,
        $data->salonId,
        $data->date,
        $timeSlot,
        $requiredSlots
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