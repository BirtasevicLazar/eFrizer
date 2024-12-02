<?php
header('Access-Control-Allow-Origin: http://192.168.0.31:5173');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

require_once 'config.php';

try {
    $searchTerm = isset($_GET['query']) ? '%' . $_GET['query'] . '%' : '';
    
    $query = "SELECT 
        id,
        salon_naziv,
        vlasnik_ime,
        adresa,
        grad,
        telefon,
        slug
    FROM saloni 
    WHERE (salon_naziv LIKE :searchTerm 
    OR grad LIKE :searchTerm 
    OR adresa LIKE :searchTerm)
    AND aktivan = 1
    LIMIT 10";
    
    $stmt = $conn->prepare($query);
    $stmt->bindParam(':searchTerm', $searchTerm);
    $stmt->execute();
    
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'data' => $results
    ]);

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Greška pri pretraživanju'
    ]);
}