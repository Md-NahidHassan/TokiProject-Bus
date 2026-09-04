<?php
// API Endpoint: POST /api/driver/trip_control.php
require_once '../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method Not Allowed. Use POST."]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

$driver_id = isset($data['driver_id']) ? intval($data['driver_id']) : 3;
$action = isset($data['action']) ? trim($data['action']) : ''; // 'start' | 'pause' | 'end' | 'maintenance'
$route_id = isset($data['route_id']) ? intval($data['route_id']) : 0;
$bus_id = isset($data['bus_id']) ? intval($data['bus_id']) : 0;

if (!in_array($action, ['start', 'pause', 'end', 'maintenance'])) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Invalid action. Choose 'start', 'pause', 'end', or 'maintenance'."]);
    exit();
}

$statusMap = [
    'start' => 'in_transit',
    'pause' => 'active',
    'end' => 'active',
    'maintenance' => 'maintenance'
];

$newStatus = $statusMap[$action];
$speed = ($action === 'end' || $action === 'pause') ? 0 : 35;

try {
    // 1. Find target bus
    $targetBusId = $bus_id;
    if (!$targetBusId) {
        $bStmt = $pdo->prepare("SELECT id FROM buses WHERE driver_id = :did LIMIT 1");
        $bStmt->execute(['did' => $driver_id]);
        $targetBusId = $bStmt->fetchColumn();
        if (!$targetBusId) {
            $targetBusId = $pdo->query("SELECT id FROM buses LIMIT 1")->fetchColumn();
        }
    }

    if ($targetBusId) {
        if ($route_id > 0) {
            $stmt = $pdo->prepare("
                UPDATE buses 
                SET status = :status, 
                    route_id = :route_id, 
                    driver_id = COALESCE(driver_id, :driver_id),
                    speed_kmh = :speed, 
                    last_updated = NOW()
                WHERE id = :bus_id
            ");
            $stmt->execute([
                'status' => $newStatus,
                'route_id' => $route_id,
                'driver_id' => $driver_id,
                'speed' => $speed,
                'bus_id' => $targetBusId
            ]);
        } else {
            $stmt = $pdo->prepare("
                UPDATE buses 
                SET status = :status, 
                    driver_id = COALESCE(driver_id, :driver_id),
                    speed_kmh = :speed, 
                    last_updated = NOW()
                WHERE id = :bus_id
            ");
            $stmt->execute([
                'status' => $newStatus,
                'driver_id' => $driver_id,
                'speed' => $speed,
                'bus_id' => $targetBusId
            ]);
        }
    }

    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Trip status changed to: " . strtoupper($action),
        "bus_status" => $newStatus,
        "bus_id" => (int)$targetBusId,
        "speed" => $speed
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Trip Status Change Failed: " . $e->getMessage()]);
}
?>
