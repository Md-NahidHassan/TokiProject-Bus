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

try {
    $stmt = $pdo->prepare("
        UPDATE buses 
        SET status = :status, speed_kmh = CASE WHEN :action = 'end' OR :action = 'pause' THEN 0 ELSE speed_kmh END, last_updated = NOW()
        WHERE driver_id = :driver_id
    ");

    $stmt->execute([
        'status' => $newStatus,
        'action' => $action,
        'driver_id' => $driver_id
    ]);

    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Trip status changed to: " . strtoupper($action),
        "bus_status" => $newStatus
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Trip Status Change Failed: " . $e->getMessage()]);
}
