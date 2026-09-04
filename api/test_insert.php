<?php
require_once 'config/db.php';
try {
    $bus_id = $pdo->query("SELECT id FROM buses LIMIT 1")->fetchColumn();
    $route_id = $pdo->query("SELECT id FROM routes LIMIT 1")->fetchColumn();
    
    $stmt = $pdo->prepare("INSERT INTO schedules (bus_id, route_id, departure_time, arrival_time, shift, day_type, status) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$bus_id, $route_id, '08:00:00', '09:00:00', 'morning', 'regular', 'scheduled']);
    echo "Success! ID: " . $pdo->lastInsertId();
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
