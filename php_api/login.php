<?php
require_once 'cors.php'; 
require_once 'config.php';

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['email']) || !isset($data['password'])) {
    echo json_encode([
        'success' => false,
        'error' => 'Nedostaju podaci za prijavu'
    ]);
    exit;
}

try {
    $stmt = $conn->prepare("SELECT id, salon_naziv as salonName, vlasnik_ime as ownerName, 
                           email, lozinka, telefon as phone, adresa as address, 
                           grad as city, aktivan, slug 
                           FROM saloni 
                           WHERE email = ? AND aktivan = 1");
    $stmt->execute([$data['email']]);
    $salon = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($salon && password_verify($data['password'], $salon['lozinka'])) {
        // Uklanjamo osetljive podatke pre slanja
        unset($salon['lozinka']);
        
        echo json_encode([
            'success' => true,
            'salonId' => $salon['id'],
            'salonData' => [
                'id' => $salon['id'],
                'salonName' => $salon['salonName'],
                'ownerName' => $salon['ownerName'],
                'email' => $salon['email'],
                'phone' => $salon['phone'],
                'address' => $salon['address'],
                'city' => $salon['city'],
                'slug' => $salon['slug']
            ]
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'error' => 'Pogrešan email ili lozinka'
        ]);
    }
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Greška pri prijavi: ' . $e->getMessage()
    ]);
}
?>