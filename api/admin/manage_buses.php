<?php
// API Endpoint: GET / POST /api/admin/manage_buses.php
require_once '../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $pdo->query("
            SELECT 
                b.id,
                b.bus_number,
                b.registration_number,
                b.capacity,
                b.driver_id,
                b.route_id,
                b.status,
                b.current_lat,
                b.current_lng,
                b.speed_kmh,
                b.last_updated,
                u.name AS driver_name,
                u.phone AS driver_phone,
                r.route_name
            FROM buses b
            LEFT JOIN users u ON b.driver_id = u.id
            LEFT JOIN routes r ON b.route_id = r.id
            ORDER BY b.id DESC
        ");
        $buses = $stmt->fetchAll();

        http_response_code(200);
        echo json_encode(["success" => true, "count" => count($buses), "data" => $buses]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Fetch failed: " . $e->getMessage()]);
    }
    exit();
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    $bus_number = isset($data['bus_number']) ? trim($data['bus_number']) : '';
    $registration_number = isset($data['registration_number']) ? trim($data['registration_number']) : '';
    $capacity = isset($data['capacity']) ? intval($data['capacity']) : 52;
    $driver_id = !empty($data['driver_id']) ? intval($data['driver_id']) : null;
    $route_id = !empty($data['route_id']) ? intval($data['route_id']) : null;

    if (empty($bus_number) || empty($registration_number)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Bus Number and Registration Number are required."]);
        exit();
    }

    try {
        $stmt = $pdo->prepare("
            INSERT INTO buses (bus_number, registration_number, capacity, driver_id, route_id, status)
            VALUES (:bus_number, :registration_number, :capacity, :driver_id, :route_id, 'active')
        ");
        $stmt->execute([
            'bus_number' => $bus_number,
            'registration_number' => $registration_number,
            'capacity' => $capacity,
            'driver_id' => $driver_id,
            'route_id' => $route_id
        ]);

        http_response_code(201);
        echo json_encode(["success" => true, "message" => "Bus added successfully.", "bus_id" => $pdo->lastInsertId()]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Failed to add bus: " . $e->getMessage()]);
    }
    exit();
}

if ($method === 'PUT') {
    $id = isset($_GET['id']) ? intval($_GET['id']) : (isset($data['id']) ? intval($data['id']) : 0);
    if (!$id) { http_response_code(400); echo json_encode(["success" => false, "message" => "Missing ID"]); exit; }
    
    $bus_number = isset($data['bus_number']) ? trim($data['bus_number']) : '';
    $registration_number = isset($data['registration_number']) ? trim($data['registration_number']) : '';
    $capacity = isset($data['capacity']) ? intval($data['capacity']) : 52;
    $driver_id = !empty($data['driver_id']) ? intval($data['driver_id']) : null;
    $route_id = !empty($data['route_id']) ? intval($data['route_id']) : null;
    $status = isset($data['status']) ? trim($data['status']) : 'active';

    try {
        $stmt = $pdo->prepare("UPDATE buses SET bus_number=?, registration_number=?, capacity=?, driver_id=?, route_id=?, status=? WHERE id=?");
        $stmt->execute([$bus_number, $registration_number, $capacity, $driver_id, $route_id, $status, $id]);
        echo json_encode(["success" => true, "message" => "Bus updated successfully."]);
    } catch (PDOException $e) {
        http_response_code(500); echo json_encode(["success" => false, "message" => "Update failed: " . $e->getMessage()]);
    }
    exit();
}

if ($method === 'DELETE') {
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    try {
        $stmt = $pdo->prepare("DELETE FROM buses WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(["success" => true, "message" => "Bus deleted"]);
    } catch(Exception $e) { echo json_encode(["success" => false, "message" => "Delete failed"]); }
    exit();
}

http_response_code(405);
echo json_encode(["success" => false, "message" => "Method Not Allowed."]);
