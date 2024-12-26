<?php
require_once 'cors.php'; 
require_once 'config.php';

function generateSlug($salonName) {
    $slug = strtolower(trim(preg_replace('/[^A-Za-z0-9-]+/', '-', $salonName)));
    return $slug;
}

function getUniqueSlug($conn, $salonName) {
    $baseSlug = generateSlug($salonName);
    $slug = $baseSlug;
    $counter = 1;
    
    while (true) {
        $stmt = $conn->prepare("SELECT id FROM saloni WHERE slug = ?");
        $stmt->execute([$slug]);
        
        if ($stmt->rowCount() === 0) {
            return $slug;
        }
        
        $slug = $baseSlug . '-' . $counter;
        $counter++;
    }
}
?> 