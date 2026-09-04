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
$bus_id = isset($data['bus_id']) ? intval($data['bus_id']) : 0;
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
    if ($bus_id > 0) {
        $stmtBus = $pdo->prepare("
            UPDATE buses 
            SET current_lat = :lat, current_lng = :lng, speed_kmh = :speed, status = :status, last_updated = NOW() 
            WHERE id = :bus_id
        ");
        $stmtBus->execute([
            'lat' => $lat,
            'lng' => $lng,
            'speed' => $speed,
            'status' => $status,
            'bus_id' => $bus_id
        ]);
    } else {
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
            $firstBusId = $pdo->query("SELECT id FROM buses LIMIT 1")->fetchColumn();
            if ($firstBusId) {
                $stmtFallback = $pdo->prepare("
                    UPDATE buses 
                    SET current_lat = :lat, current_lng = :lng, speed_kmh = :speed, status = :status, driver_id = :driver_id, last_updated = NOW() 
                    WHERE id = :bus_id
                ");
                $stmtFallback->execute([
                    'lat' => $lat,
                    'lng' => $lng,
                    'speed' => $speed,
                    'status' => $status,
                    'driver_id' => $driver_id,
                    'bus_id' => $firstBusId
                ]);
            }
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
?>
