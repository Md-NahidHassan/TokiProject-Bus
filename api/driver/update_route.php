<?php
// API Endpoint: POST /api/driver/update_route.php
require_once '../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method Not Allowed. Use POST."]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

$driver_id = isset($data['driver_id']) ? intval($data['driver_id']) : 3;
$route_id = isset($data['route_id']) ? intval($data['route_id']) : 0;
$bus_id = isset($data['bus_id']) ? intval($data['bus_id']) : 0;

if (!$route_id) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Route ID is required."]);
    exit();
}

try {
    // 1. Verify that the route exists
    $rStmt = $pdo->prepare("SELECT id, route_name, start_location, end_location, distance_km FROM routes WHERE id = :rid LIMIT 1");
    $rStmt->execute(['rid' => $route_id]);
    $route = $rStmt->fetch();

    if (!$route) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Selected route not found."]);
        exit();
    }

    // 2. Find which bus to update
    // Priority: bus_id if given, or bus assigned to driver_id, or first active bus
    $targetBusId = null;
    if ($bus_id > 0) {
        $targetBusId = $bus_id;
    } else {
        $bStmt = $pdo->prepare("SELECT id FROM buses WHERE driver_id = :did LIMIT 1");
        $bStmt->execute(['did' => $driver_id]);
        $targetBusId = $bStmt->fetchColumn();
        
        if (!$targetBusId) {
            // If no bus assigned to this driver yet, assign to first bus
            $targetBusId = $pdo->query("SELECT id FROM buses LIMIT 1")->fetchColumn();
        }
    }

    if ($targetBusId) {
        // Update the bus's route and ensure driver is linked
        $uStmt = $pdo->prepare("
            UPDATE buses 
            SET route_id = :route_id, 
                driver_id = COALESCE(driver_id, :driver_id),
                last_updated = NOW() 
            WHERE id = :bus_id
        ");
        $uStmt->execute([
            'route_id' => $route_id,
            'driver_id' => $driver_id,
            'bus_id' => $targetBusId
        ]);
    }

    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Trip route successfully changed to: " . $route['route_name'],
        "bus_id" => $targetBusId,
        "route" => $route
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Failed to update route: " . $e->getMessage()]);
}
?>
