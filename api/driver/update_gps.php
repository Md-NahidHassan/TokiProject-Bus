<?php
// API Endpoint: POST /api/driver/update_gps.php
require_once '../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method Not Allowed. Use POST."]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

$driver_id = isset($data['driver_id']) ? intval($data['driver_id']) : 3;
$lat = isset($data['lat']) ? floatval($data['lat']) : null;
$lng = isset($data['lng']) ? floatval($data['lng']) : null;
$speed = isset($data['speed']) ? intval($data['speed']) : 0;
$status = isset($data['status']) ? trim($data['status']) : 'in_transit';

if ($lat === null || $lng === null) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Latitude (lat) and Longitude (lng) are required."]);
    exit();
}

try {
    // Update bus assigned to this driver
    $stmt = $pdo->prepare("
        UPDATE buses 
        SET current_lat = :lat, current_lng = :lng, speed_kmh = :speed, status = :status, last_updated = NOW()
        WHERE driver_id = :driver_id
    ");

    $stmt->execute([
        'lat' => $lat,
        'lng' => $lng,
        'speed' => $speed,
        'status' => $status,
        'driver_id' => $driver_id
    ]);

    if ($stmt->rowCount() === 0) {
        // Fallback if update by bus_id
        if (isset($data['bus_id'])) {
            $stmtBus = $pdo->prepare("UPDATE buses SET current_lat = :lat, current_lng = :lng, speed_kmh = :speed, status = :status, last_updated = NOW() WHERE id = :bus_id");
            $stmtBus->execute(['lat' => $lat, 'lng' => $lng, 'speed' => $speed, 'status' => $status, 'bus_id' => intval($data['bus_id'])]);
        }
    }

    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Driver GPS broadcast updated.",
        "lat" => $lat,
        "lng" => $lng,
        "speed" => $speed,
        "status" => $status,
        "timestamp" => date('Y-m-d H:i:s')
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Failed to update GPS: " . $e->getMessage()]);
}
