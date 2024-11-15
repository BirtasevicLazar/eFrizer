<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'error' => 'Pogrešan metod zahteva'
    ]);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode([
        'success' => false,
        'error' => 'Nisu prosleđeni podaci'
    ]);
    exit;
}

try {
    $stmt = $conn->prepare("SELECT id FROM saloni WHERE email = ?");
    $stmt->execute([$data['email']]);
    
    if ($stmt->rowCount() > 0) {
        echo json_encode([
            'success' => false,
            'error' => 'Email adresa je već registrovana'
        ]);
        exit;
    }

    $sql = "INSERT INTO saloni (salon_naziv, vlasnik_ime, email, telefon, lozinka, adresa, grad, datum_registracije, aktivan) 
            VALUES (:salon_naziv, :vlasnik_ime, :email, :telefon, :lozinka, :adresa, :grad, NOW(), 1)";
    
    $stmt = $conn->prepare($sql);
    
    $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
    
    $stmt->execute([
        ':salon_naziv' => $data['salonName'],
        ':vlasnik_ime' => $data['ownerName'],
        ':email' => $data['email'],
        ':telefon' => $data['phone'],
        ':lozinka' => $hashedPassword,
        ':adresa' => $data['address'],
        ':grad' => $data['city']
    ]);

    $salonId = $conn->lastInsertId();

    echo json_encode([
        'success' => true,
        'salonId' => $salonId,
        'message' => 'Salon je uspešno registrovan'
    ]);

} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Greška pri registraciji: ' . $e->getMessage()
    ]);
}
?>