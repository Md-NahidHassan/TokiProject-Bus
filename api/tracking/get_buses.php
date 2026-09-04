<?php
// API Endpoint: GET /api/tracking/get_buses.php
// Returns all buses with live GPS coordinates, driver info and route
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
require_once '../config/db.php';

try {
    $stmt = $pdo->query("
        SELECT
            b.id,
            b.bus_number        AS bus,
            b.registration_number,
            b.capacity,
            b.current_lat       AS lat,
            b.current_lng       AS lng,
            b.speed_kmh         AS speed,
            b.status,
            b.last_updated,
            u.name              AS driver,
            r.route_name        AS route
        FROM buses b
        LEFT JOIN users u ON b.driver_id = u.id
        LEFT JOIN routes r ON b.route_id = r.id
        ORDER BY b.id ASC
    ");

    $buses = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Ensure numeric types are correct for JS
    $buses = array_map(function($b) {
        return [
            'id'           => (int)   $b['id'],
            'bus'          =>         $b['bus'],
            'lat'          => (float) $b['lat'],
            'lng'          => (float) $b['lng'],
            'speed'        => (int)   $b['speed'],
            'status'       =>         $b['status'],
            'driver'       =>         $b['driver'] ?? 'Unassigned',
            'route'        =>         $b['route']  ?? 'No Route',
            'capacity'     => (int)   $b['capacity'],
            'last_updated' =>         $b['last_updated'],
        ];
    }, $buses);

    http_response_code(200);
    echo json_encode([
        "success"      => true,
        "count"        => count($buses),
        "data"         => $buses,
        "server_time"  => date('Y-m-d H:i:s'),
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
}
