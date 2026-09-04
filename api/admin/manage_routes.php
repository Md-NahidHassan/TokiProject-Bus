<?php
// API Endpoint: GET / POST /api/admin/manage_routes.php
require_once '../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $pdo->query("
            SELECT r.*, COUNT(bs.id) AS stop_count
            FROM routes r
            LEFT JOIN bus_stops bs ON r.id = bs.route_id
            GROUP BY r.id
            ORDER BY r.id ASC
        ");
        $routes = $stmt->fetchAll();

        http_response_code(200);
        echo json_encode(["success" => true, "data" => $routes]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error fetching routes: " . $e->getMessage()]);
    }
    exit();
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    $route_name = isset($data['route_name']) ? trim($data['route_name']) : '';
    $start_location = isset($data['start_location']) ? trim($data['start_location']) : '';
    $end_location = isset($data['end_location']) ? trim($data['end_location']) : '';
    $distance_km = isset($data['distance_km']) ? floatval($data['distance_km']) : 10.0;
    $estimated_minutes = isset($data['estimated_minutes']) ? intval($data['estimated_minutes']) : 30;

    if (empty($route_name) || empty($start_location) || empty($end_location)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Route Name, Start Location, and End Location are required."]);
        exit();
    }

    try {
        $stmt = $pdo->prepare("
            INSERT INTO routes (route_name, start_location, end_location, distance_km, estimated_minutes, status)
            VALUES (:route_name, :start_location, :end_location, :distance_km, :estimated_minutes, 'active')
        ");
        $stmt->execute([
            'route_name' => $route_name,
            'start_location' => $start_location,
            'end_location' => $end_location,
            'distance_km' => $distance_km,
            'estimated_minutes' => $estimated_minutes
        ]);

        http_response_code(201);
        echo json_encode(["success" => true, "message" => "Route created successfully.", "route_id" => $pdo->lastInsertId()]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error creating route: " . $e->getMessage()]);
    }
    exit();
}

if ($method === 'PUT') {
    $id = isset($_GET['id']) ? intval($_GET['id']) : (isset($data['id']) ? intval($data['id']) : 0);
    if (!$id) { http_response_code(400); echo json_encode(["success" => false, "message" => "Missing ID"]); exit; }
    
    $route_name = isset($data['route_name']) ? trim($data['route_name']) : '';
    $start_location = isset($data['start_location']) ? trim($data['start_location']) : '';
    $end_location = isset($data['end_location']) ? trim($data['end_location']) : '';
    $distance_km = isset($data['distance_km']) ? floatval($data['distance_km']) : 10.0;
    $status = isset($data['status']) ? trim($data['status']) : 'active';

    try {
        $stmt = $pdo->prepare("UPDATE routes SET route_name=?, start_location=?, end_location=?, distance_km=?, status=? WHERE id=?");
        $stmt->execute([$route_name, $start_location, $end_location, $distance_km, $status, $id]);
        echo json_encode(["success" => true, "message" => "Route updated successfully."]);
    } catch (PDOException $e) {
        http_response_code(500); echo json_encode(["success" => false, "message" => "Update failed: " . $e->getMessage()]);
    }
    exit();
}

if ($method === 'DELETE') {
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    try {
        $stmt = $pdo->prepare("DELETE FROM routes WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(["success" => true, "message" => "Route deleted"]);
    } catch(Exception $e) { echo json_encode(["success" => false, "message" => "Delete failed"]); }
    exit();
}

http_response_code(405);
echo json_encode(["success" => false, "message" => "Method Not Allowed."]);
