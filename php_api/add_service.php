<?php
require_once 'cors.php'; 
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'error' => 'Pogrešan metod zahteva'
    ]);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['salon_id'], $data['naziv_usluge'], $data['cena'], $data['trajanje'], $data['valuta'])) {
    echo json_encode([
        'success' => false,
        'error' => 'Nedostaju podaci za uslugu'
    ]);
    exit;
}

try {
    $sql = "INSERT INTO usluge (salon_id, naziv_usluge, opis, cena, trajanje, valuta) 
            VALUES (:salon_id, :naziv_usluge, :opis, :cena, :trajanje, :valuta)";
    
    $stmt = $conn->prepare($sql);
    $stmt->execute([
        ':salon_id' => $data['salon_id'],
        ':naziv_usluge' => $data['naziv_usluge'],
        ':opis' => $data['opis'],
        ':cena' => $data['cena'],
        ':trajanje' => $data['trajanje'],
        ':valuta' => $data['valuta']
    ]);

    $serviceId = $conn->lastInsertId();

    echo json_encode([
        'success' => true,
        'service' => [
            'id' => $serviceId,
            'naziv_usluge' => $data['naziv_usluge'],
            'opis' => $data['opis'],
            'cena' => $data['cena'],
            'trajanje' => $data['trajanje'],
            'valuta' => $data['valuta']
        ]
    ]);

} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Greška pri dodavanju usluge: ' . $e->getMessage()
    ]);
}
?>