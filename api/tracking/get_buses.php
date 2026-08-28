<?php
// API Endpoint: GET /api/tracking/get_buses.php
require_once '../config/db.php';

try {
    $stmt = $pdo->query("
        SELECT 
            b.id,
            b.bus_number AS bus,
            b.registration_number,
            b.capacity,
            b.current_lat AS lat,
            b.current_lng AS lng,
            b.speed_kmh AS speed,
            b.status,
            b.last_updated,
            u.name AS driver,
            r.route_name AS route
        FROM buses b
        LEFT JOIN users u ON b.driver_id = u.id
        LEFT JOIN routes r ON b.route_id = r.id
        ORDER BY b.id ASC
    ");

    $buses = $stmt->fetchAll();

    http_response_code(200);
    echo json_encode([
        "success" => true,
        "count" => count($buses),
        "data" => $buses
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error fetching buses: " . $e->getMessage()]);
}
