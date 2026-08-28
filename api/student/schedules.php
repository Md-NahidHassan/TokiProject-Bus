<?php
// API Endpoint: GET /api/student/schedules.php
require_once '../config/db.php';

try {
    $stmt = $pdo->query("
        SELECT 
            s.id,
            b.bus_number AS bus,
            b.capacity,
            b.status AS bus_status,
            r.route_name AS route,
            r.start_location,
            r.end_location,
            r.distance_km,
            s.departure_time,
            s.arrival_time,
            s.shift,
            s.day_type,
            s.status AS schedule_status
        FROM schedules s
        JOIN buses b ON s.bus_id = b.id
        JOIN routes r ON s.route_id = r.id
        ORDER BY s.departure_time ASC
    ");

    $schedules = $stmt->fetchAll();

    http_response_code(200);
    echo json_encode([
        "success" => true,
        "count" => count($schedules),
        "data" => $schedules
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error fetching schedules: " . $e->getMessage()]);
}
