<?php
// API Endpoint: POST /api/tracking/update_location.php
require_once '../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method Not Allowed. Use POST."]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

$bus_id = isset($data['bus_id']) ? intval($data['bus_id']) : 0;
$lat = isset($data['lat']) ? floatval($data['lat']) : null;
$lng = isset($data['lng']) ? floatval($data['lng']) : null;
$speed = isset($data['speed']) ? intval($data['speed']) : 0;
$status = isset($data['status']) ? trim($data['status']) : 'in_transit';

if ($bus_id <= 0 || $lat === null || $lng === null) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "bus_id, lat, and lng are required."]);
    exit();
}

try {
    $stmt = $pdo->prepare("
        UPDATE buses 
        SET current_lat = :lat, current_lng = :lng, speed_kmh = :speed, status = :status, last_updated = NOW()
        WHERE id = :bus_id
    ");
    
    $stmt->execute([
        'lat' => $lat,
        'lng' => $lng,
        'speed' => $speed,
        'status' => $status,
        'bus_id' => $bus_id
    ]);

    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "GPS Location Updated Successfully",
        "bus_id" => $bus_id,
        "lat" => $lat,
        "lng" => $lng
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Update Failed: " . $e->getMessage()]);
}
