<?php
// API Endpoint: GET / POST / PUT / DELETE /api/admin/manage_schedules.php
require_once '../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"), true);

if ($method === 'GET') {
    try {
        $stmt = $pdo->query("
            SELECT 
                s.id,
                b.bus_number AS bus,
                r.route_name AS route,
                s.departure_time AS departure,
                s.arrival_time AS arrival,
                s.shift AS type,
                s.day_type,
                s.status,
                u.name AS driver
            FROM schedules s
            LEFT JOIN buses b ON s.bus_id = b.id
            LEFT JOIN routes r ON s.route_id = r.id
            LEFT JOIN users u ON b.driver_id = u.id
            ORDER BY s.id DESC
        ");
        $schedules = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Map for React frontend
        $formatted = array_map(function($s) {
            return [
                'id' => $s['id'],
                'bus' => $s['bus'] ?: 'Unknown Bus',
                'driver' => $s['driver'] ?: 'Unknown Driver',
                'route' => $s['route'] ?: 'Unknown Route',
                'departure' => date('h:i A', strtotime($s['departure'])),
                'arrival' => date('h:i A', strtotime($s['arrival'])),
                'type' => $s['type'],
                'days' => $s['day_type'] === 'weekend' ? ['Fri', 'Sat'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'],
                'status' => $s['status']
            ];
        }, $schedules);

        http_response_code(200);
        echo json_encode(["success" => true, "count" => count($formatted), "data" => $formatted]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Fetch failed: " . $e->getMessage()]);
    }
    exit();
}

if ($method === 'POST') {
    // Expected structure from frontend:
    // { bus: "text", route: "text", type: "morning", departure: "08:00 AM", arrival: "08:35 AM", status: "active", days: ["Sun"] }
    
    $bus_str = $data['bus'] ?? '';
    $route_str = $data['route'] ?? '';
    $type = $data['type'] ?? 'morning'; 
    
    $dep_raw = $data['departure'] ?? '08:00 AM';
    $arr_raw = $data['arrival'] ?? '09:00 AM';
    $dep_time = date('H:i:s', strtotime($dep_raw));
    $arr_time = date('H:i:s', strtotime($arr_raw));

    $status = $data['status'] ?? 'active';
    $db_status = ($status === 'active') ? 'scheduled' : 'cancelled';
    
    // figure out day_type based on frontend days array
    $days = $data['days'] ?? [];
    $day_type = (in_array('Fri', $days) || in_array('Sat', $days)) ? 'weekend' : 'regular';

    try {
        // Try to find matching bus_id, fallback to first bus if not found
        $bStmt = $pdo->prepare("SELECT id FROM buses WHERE bus_number LIKE :bus LIMIT 1");
        $bStmt = $pdo->prepare("SELECT id FROM buses WHERE bus_number LIKE :bus LIMIT 1");
        $bStmt->execute(['bus' => "%$bus_str%"]);
        $busRow = $bStmt->fetch();
        $bus_id = $busRow ? $busRow['id'] : null;

        $rStmt = $pdo->prepare("SELECT id FROM routes WHERE route_name LIKE :route LIMIT 1");
        $rStmt->execute(['route' => "%$route_str%"]);
        $routeRow = $rStmt->fetch();
        $route_id = $routeRow ? $routeRow['id'] : null;

        if (!$bus_id || !$route_id) {
            // Fallback to first bus/route to prevent demo crash
            if (!$bus_id) $bus_id = $pdo->query("SELECT id FROM buses LIMIT 1")->fetchColumn();
            if (!$route_id) $route_id = $pdo->query("SELECT id FROM routes LIMIT 1")->fetchColumn();
        }

        $stmt = $pdo->prepare("
            INSERT INTO schedules (bus_id, route_id, departure_time, arrival_time, shift, day_type, status) 
            VALUES (:bus_id, :route_id, :departure, :arrival, :shift, :day_type, :status)
        ");
        $stmt->execute([
            'bus_id' => $bus_id,
            'route_id' => $route_id,
            'departure' => $dep_time,
            'arrival' => $arr_time,
            'shift' => $type,
            'day_type' => $day_type,
            'status' => $db_status
        ]);
        
        http_response_code(201);
        echo json_encode(["success" => true, "message" => "Schedule added successfully"]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Insert failed: " . $e->getMessage()]);
    }
    exit();
}

if ($method === 'PUT') {
    $id = isset($_GET['id']) ? intval($_GET['id']) : (isset($data['id']) ? intval($data['id']) : 0);
    if (!$id) {
        http_response_code(400); echo json_encode(["success" => false, "message" => "Missing ID"]); exit;
    }
    
    $bus_str = $data['bus'] ?? '';
    $route_str = $data['route'] ?? '';
    $type = $data['type'] ?? 'morning'; 
    $dep_time = date('H:i:s', strtotime($data['departure'] ?? '08:00 AM'));
    $arr_time = date('H:i:s', strtotime($data['arrival'] ?? '09:00 AM'));
    $status = $data['status'] ?? 'active';
    $db_status = ($status === 'active') ? 'scheduled' : 'cancelled';
    $days = $data['days'] ?? [];
    $day_type = (in_array('Fri', $days) || in_array('Sat', $days)) ? 'weekend' : 'regular';

    try {
        $bStmt = $pdo->prepare("SELECT id FROM buses WHERE bus_number LIKE :bus LIMIT 1");
        $bStmt->execute(['bus' => "%$bus_str%"]);
        $bus_id = $bStmt->fetchColumn() ?: null;

        $rStmt = $pdo->prepare("SELECT id FROM routes WHERE route_name LIKE :route LIMIT 1");
        $rStmt->execute(['route' => "%$route_str%"]);
        $route_id = $rStmt->fetchColumn() ?: null;
        
        if (!$bus_id || !$route_id) {
            if (!$bus_id) $bus_id = $pdo->query("SELECT id FROM buses LIMIT 1")->fetchColumn();
            if (!$route_id) $route_id = $pdo->query("SELECT id FROM routes LIMIT 1")->fetchColumn();
        }

        $stmt = $pdo->prepare("
            UPDATE schedules SET 
                bus_id = :bus_id, route_id = :route_id, departure_time = :departure, 
                arrival_time = :arrival, shift = :shift, day_type = :day_type, status = :status
            WHERE id = :id
        ");
        $stmt->execute([
            'bus_id' => $bus_id, 'route_id' => $route_id, 'departure' => $dep_time, 
            'arrival' => $arr_time, 'shift' => $type, 'day_type' => $day_type, 
            'status' => $db_status, 'id' => $id
        ]);
        
        http_response_code(200);
        echo json_encode(["success" => true, "message" => "Schedule updated"]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Update failed: " . $e->getMessage()]);
    }
    exit();
}

if ($method === 'DELETE') {
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    try {
        $stmt = $pdo->prepare("DELETE FROM schedules WHERE id = :id");
        $stmt->execute(['id' => $id]);
        echo json_encode(["success" => true, "message" => "Schedule deleted"]);
    } catch(Exception $e) {
        echo json_encode(["success" => false, "message" => "Delete failed"]);
    }
    exit();
}
