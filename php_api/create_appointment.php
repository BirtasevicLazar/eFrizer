<?php
require_once 'cors.php'; 
require_once 'config.php';

try {
    $data = json_decode(file_get_contents("php://input"));
    
    // Provera da li postoje generisani termini
    $checkGeneratedSlots = $conn->prepare("
        SELECT COUNT(*) 
        FROM time_slots 
        WHERE salon_id = :salonId 
        AND frizer_id = :barberId 
        AND date = :date
        AND time_slot = :timeSlot
    ");

    $checkGeneratedSlots->execute([
        ':salonId' => $data->salonId,
        ':barberId' => $data->barberId,
        ':date' => $data->date,
        ':timeSlot' => $data->timeSlot
    ]);

    if ($checkGeneratedSlots->fetchColumn() == 0) {
        throw new Exception('Nije moguće zakazati termin jer termini nisu generisani za izabrani datum');
    }
    
    // Započni transakciju
    $conn->beginTransaction();
    
    // Prvo dobavi trajanje usluge
    $stmtService = $conn->prepare("
        SELECT trajanje, cena, valuta 
        FROM usluge 
        WHERE id = :serviceId AND salon_id = :salonId
    ");
    
    $stmtService->execute([
        ':serviceId' => $data->serviceId,
        ':salonId' => $data->salonId
    ]);
    
    $service = $stmtService->fetch(PDO::FETCH_ASSOC);
    $requiredSlots = ceil($service['trajanje'] / 15);

    // Proveri da li su svi potrebni termini slobodni
    $checkSlots = $conn->prepare("
        SELECT COUNT(*) as count
        FROM time_slots
        WHERE salon_id = :salonId
        AND frizer_id = :barberId
        AND date = :date
        AND time_slot >= :startTime
        AND time_slot < :endTime
        AND is_available = 0
    ");

    $endTime = date('H:i:s', strtotime($data->timeSlot) + ($service['trajanje'] * 60));
    
    $checkSlots->execute([
        ':salonId' => $data->salonId,
        ':barberId' => $data->barberId,
        ':date' => $data->date,
        ':startTime' => $data->timeSlot,
        ':endTime' => $endTime
    ]);

    if ($checkSlots->fetch(PDO::FETCH_ASSOC)['count'] > 0) {
        throw new Exception('Izabrani termin više nije dostupan');
    }

    // Kreiraj appointment
    $stmtAppointment = $conn->prepare("
        INSERT INTO appointments (
            salon_id, frizer_id, service_id, cena, valuta,
            date, time_slot, customer_name, customer_phone, customer_email
        ) VALUES (
            :salonId, :barberId, :serviceId, :cena, :valuta,
            :date, :timeSlot, :customerName, :customerPhone, :customerEmail
        )
    ");

    $stmtAppointment->execute([
        ':salonId' => $data->salonId,
        ':barberId' => $data->barberId,
        ':serviceId' => $data->serviceId,
        ':cena' => $service['cena'],
        ':valuta' => $service['valuta'],
        ':date' => $data->date,
        ':timeSlot' => $data->timeSlot,
        ':customerName' => $data->customerData->name,
        ':customerPhone' => $data->customerData->phone,
        ':customerEmail' => $data->customerData->email
    ]);

    $appointmentId = $conn->lastInsertId();

    // Ažuriraj time_slots tabelu
    $updateSlots = $conn->prepare("
        UPDATE time_slots 
        SET is_available = 0, 
            appointment_id = :appointmentId 
        WHERE salon_id = :salonId 
        AND frizer_id = :barberId 
        AND date = :date 
        AND time_slot >= :startTime
        AND time_slot < :endTime
    ");

    $updateSlots->execute([
        ':appointmentId' => $appointmentId,
        ':salonId' => $data->salonId,
        ':barberId' => $data->barberId,
        ':date' => $data->date,
        ':startTime' => $data->timeSlot,
        ':endTime' => $endTime
    ]);

    $conn->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Termin uspešno zakazan',
        'appointmentId' => $appointmentId
    ]);

} catch(Exception $e) {
    $conn->rollBack();
    error_log("Greška: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
} 