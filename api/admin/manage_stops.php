<?php
// API Endpoint: GET / POST / PUT / DELETE /api/admin/manage_stops.php
require_once '../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"), true);

if ($method === 'GET') {
    try {
        $stmt = $pdo->query("
            SELECT bs.*, r.route_name 
            FROM bus_stops bs 
            LEFT JOIN routes r ON bs.route_id = r.id 
            ORDER BY r.id, bs.stop_order ASC
        ");
        $stops = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $formatted = array_map(function($s) {
            return [
                'id' => $s['id'],
                'name' => $s['stop_name'],
                'route' => $s['route_name'] ?? 'Unknown Route',
                'route_id' => $s['route_id'],
                'order' => $s['stop_order'],
                'arrival' => $s['arrival_time'] ? date('h:i A', strtotime($s['arrival_time'])) : 'N/A',
                'lat' => $s['lat'],
                'lng' => $s['lng']
            ];
        }, $stops);

        http_response_code(200);
        echo json_encode(["success" => true, "data" => $formatted]);
    } catch (PDOException $e) {
        http_response_code(500); echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
    exit();
}

if ($method === 'POST') {
    $stop_name = $data['stop_name'] ?? '';
    $route_str = $data['route'] ?? '';
    $stop_order = intval($data['order'] ?? 1);
    $lat = floatval($data['latitude'] ?? $data['lat'] ?? 0);
    $lng = floatval($data['longitude'] ?? $data['lng'] ?? 0);
    $arrival_time = $data['arrival_time'] ?? null;

    try {
        $rStmt = $pdo->prepare("SELECT id FROM routes WHERE route_name LIKE ? LIMIT 1");
        $rStmt->execute(["%$route_str%"]);
        $route_id = $rStmt->fetchColumn();

        if (!$route_id) {
            $route_id = $pdo->query("SELECT id FROM routes LIMIT 1")->fetchColumn();
        }

        $stmt = $pdo->prepare("INSERT INTO bus_stops (route_id, stop_name, stop_order, arrival_time, lat, lng) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$route_id, $stop_name, $stop_order, $arrival_time, $lat, $lng]);
        echo json_encode(["success" => true, "message" => "Stop added successfully!"]);
    } catch (Exception $e) { 
        http_response_code(500);
        echo json_encode(["success" => false, "message" => $e->getMessage()]); 
    }
    exit();
}

if ($method === 'PUT') {
    $id = $_GET['id'] ?? $data['id'] ?? 0;
    
    $stop_name = $data['stop_name'] ?? '';
    $route_str = $data['route'] ?? '';
    $stop_order = intval($data['order'] ?? 1);
    $lat = floatval($data['latitude'] ?? $data['lat'] ?? 0);
    $lng = floatval($data['longitude'] ?? $data['lng'] ?? 0);
    $arrival_time = $data['arrival_time'] ?? null;

    try {
        $rStmt = $pdo->prepare("SELECT id FROM routes WHERE route_name LIKE ? LIMIT 1");
        $rStmt->execute(["%$route_str%"]);
        $route_id = $rStmt->fetchColumn();

        if (!$route_id) {
            $route_id = $pdo->query("SELECT id FROM routes LIMIT 1")->fetchColumn();
        }

        $stmt = $pdo->prepare("UPDATE bus_stops SET stop_name=?, route_id=?, stop_order=?, arrival_time=?, lat=?, lng=? WHERE id=?");
        $stmt->execute([$stop_name, $route_id, $stop_order, $arrival_time, $lat, $lng, $id]);
        echo json_encode(["success" => true, "message" => "Stop updated!"]);
    } catch (Exception $e) { 
        http_response_code(500);
        echo json_encode(["success" => false, "message" => $e->getMessage()]); 
    }
    exit();
}

if ($method === 'DELETE') {
    $id = $_GET['id'] ?? 0;
    try {
        $stmt = $pdo->prepare("DELETE FROM bus_stops WHERE id=?");
        $stmt->execute([$id]);
        echo json_encode(["success" => true, "message" => "Stop deleted!"]);
    } catch (Exception $e) { 
        http_response_code(500);
        echo json_encode(["success" => false, "message" => $e->getMessage()]); 
    }
    exit();
}

http_response_code(405);
echo json_encode(["success" => false, "message" => "Method Not Allowed."]);
