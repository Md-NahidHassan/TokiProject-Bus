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
                s.bus_id,
                s.route_id,
                s.driver_id,
                b.bus_number AS bus,
                r.route_name AS route,
                s.departure_time AS departure,
                s.arrival_time AS arrival,
                s.shift AS type,
                s.day_type,
                s.status,
                COALESCE(u_sched.name, u_bus.name, 'Unassigned Driver') AS driver,
                COALESCE(u_sched.id, u_bus.id) AS effective_driver_id
            FROM schedules s
            LEFT JOIN buses b ON s.bus_id = b.id
            LEFT JOIN routes r ON s.route_id = r.id
            LEFT JOIN users u_sched ON s.driver_id = u_sched.id
            LEFT JOIN users u_bus ON b.driver_id = u_bus.id
            ORDER BY s.id DESC
        ");
        $schedules = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Map for React frontend
        $formatted = array_map(function($s) {
            return [
                'id' => (int)$s['id'],
                'bus_id' => (int)$s['bus_id'],
                'route_id' => (int)$s['route_id'],
                'driver_id' => $s['driver_id'] ? (int)$s['driver_id'] : ($s['effective_driver_id'] ? (int)$s['effective_driver_id'] : null),
                'bus' => $s['bus'] ?: 'Unknown Bus',
                'driver' => $s['driver'] ?: 'Unassigned Driver',
                'route' => $s['route'] ?: 'Unknown Route',
                'departure' => date('h:i A', strtotime($s['departure'])),
                'arrival' => date('h:i A', strtotime($s['arrival'])),
                'type' => $s['type'],
                'days' => $s['day_type'] === 'weekend' ? ['Fri', 'Sat'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'],
                'status' => ($s['status'] === 'scheduled' || $s['status'] === 'active') ? 'active' : 'inactive'
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
    $bus_id = !empty($data['bus_id']) ? intval($data['bus_id']) : null;
    $route_id = !empty($data['route_id']) ? intval($data['route_id']) : null;
    $driver_id = !empty($data['driver_id']) ? intval($data['driver_id']) : null;

    $bus_str = trim($data['bus'] ?? '');
    $route_str = trim($data['route'] ?? '');
    $driver_str = trim($data['driver'] ?? '');

    $type = $data['type'] ?? 'morning'; 
    $dep_raw = $data['departure'] ?? '08:00 AM';
    $arr_raw = $data['arrival'] ?? '09:00 AM';
    $dep_time = date('H:i:s', strtotime($dep_raw));
    $arr_time = date('H:i:s', strtotime($arr_raw));

    $status = $data['status'] ?? 'active';
    $db_status = ($status === 'active' || $status === 'scheduled') ? 'scheduled' : 'cancelled';
    
    $days = $data['days'] ?? [];
    $day_type = (in_array('Fri', $days) || in_array('Sat', $days)) ? 'weekend' : 'regular';

    try {
        // Resolve bus_id
        if (!$bus_id && !empty($bus_str)) {
            $bStmt = $pdo->prepare("SELECT id FROM buses WHERE bus_number = :bus OR bus_number LIKE :bus_like LIMIT 1");
            $bStmt->execute(['bus' => $bus_str, 'bus_like' => "%$bus_str%"]);
            $bus_id = $bStmt->fetchColumn() ?: null;
        }
        if (!$bus_id) {
            $bus_id = $pdo->query("SELECT id FROM buses LIMIT 1")->fetchColumn();
        }

        // Resolve route_id
        if (!$route_id && !empty($route_str)) {
            $rStmt = $pdo->prepare("SELECT id FROM routes WHERE route_name = :route OR route_name LIKE :route_like LIMIT 1");
            $rStmt->execute(['route' => $route_str, 'route_like' => "%$route_str%"]);
            $route_id = $rStmt->fetchColumn() ?: null;
        }
        if (!$route_id) {
            $route_id = $pdo->query("SELECT id FROM routes LIMIT 1")->fetchColumn();
        }

        // Resolve driver_id
        if (!$driver_id && !empty($driver_str) && $driver_str !== 'Unassigned Driver' && $driver_str !== 'Unassigned') {
            $dStmt = $pdo->prepare("SELECT id FROM users WHERE role = 'driver' AND (name = :driver OR name LIKE :driver_like) LIMIT 1");
            $dStmt->execute(['driver' => $driver_str, 'driver_like' => "%$driver_str%"]);
            $driver_id = $dStmt->fetchColumn() ?: null;
        }
        if (!$driver_id && $bus_id) {
            $bDriverStmt = $pdo->prepare("SELECT driver_id FROM buses WHERE id = :bid");
            $bDriverStmt->execute(['bid' => $bus_id]);
            $driver_id = $bDriverStmt->fetchColumn() ?: null;
        }

        $stmt = $pdo->prepare("
            INSERT INTO schedules (bus_id, route_id, driver_id, departure_time, arrival_time, shift, day_type, status) 
            VALUES (:bus_id, :route_id, :driver_id, :departure, :arrival, :shift, :day_type, :status)
        ");
        $stmt->execute([
            'bus_id' => $bus_id,
            'route_id' => $route_id,
            'driver_id' => $driver_id,
            'departure' => $dep_time,
            'arrival' => $arr_time,
            'shift' => $type,
            'day_type' => $day_type,
            'status' => $db_status
        ]);

        // If driver assigned, link to bus if bus has no driver
        if ($driver_id && $bus_id) {
            $pdo->prepare("UPDATE buses SET driver_id = :did WHERE id = :bid AND (driver_id IS NULL OR driver_id = 0)")
                ->execute(['did' => $driver_id, 'bid' => $bus_id]);
        }
        
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
    
    $bus_id = !empty($data['bus_id']) ? intval($data['bus_id']) : null;
    $route_id = !empty($data['route_id']) ? intval($data['route_id']) : null;
    $driver_id = !empty($data['driver_id']) ? intval($data['driver_id']) : null;

    $bus_str = trim($data['bus'] ?? '');
    $route_str = trim($data['route'] ?? '');
    $driver_str = trim($data['driver'] ?? '');

    $type = $data['type'] ?? 'morning'; 
    $dep_time = date('H:i:s', strtotime($data['departure'] ?? '08:00 AM'));
    $arr_time = date('H:i:s', strtotime($data['arrival'] ?? '09:00 AM'));
    $status = $data['status'] ?? 'active';
    $db_status = ($status === 'active' || $status === 'scheduled') ? 'scheduled' : 'cancelled';
    $days = $data['days'] ?? [];
    $day_type = (in_array('Fri', $days) || in_array('Sat', $days)) ? 'weekend' : 'regular';

    try {
        if (!$bus_id && !empty($bus_str)) {
            $bStmt = $pdo->prepare("SELECT id FROM buses WHERE bus_number = :bus OR bus_number LIKE :bus_like LIMIT 1");
            $bStmt->execute(['bus' => $bus_str, 'bus_like' => "%$bus_str%"]);
            $bus_id = $bStmt->fetchColumn() ?: null;
        }
        if (!$bus_id) {
            $bus_id = $pdo->query("SELECT id FROM buses LIMIT 1")->fetchColumn();
        }

        if (!$route_id && !empty($route_str)) {
            $rStmt = $pdo->prepare("SELECT id FROM routes WHERE route_name = :route OR route_name LIKE :route_like LIMIT 1");
            $rStmt->execute(['route' => $route_str, 'route_like' => "%$route_str%"]);
            $route_id = $rStmt->fetchColumn() ?: null;
        }
        if (!$route_id) {
            $route_id = $pdo->query("SELECT id FROM routes LIMIT 1")->fetchColumn();
        }

        if (!$driver_id && !empty($driver_str) && $driver_str !== 'Unassigned Driver' && $driver_str !== 'Unassigned') {
            $dStmt = $pdo->prepare("SELECT id FROM users WHERE role = 'driver' AND (name = :driver OR name LIKE :driver_like) LIMIT 1");
            $dStmt->execute(['driver' => $driver_str, 'driver_like' => "%$driver_str%"]);
            $driver_id = $dStmt->fetchColumn() ?: null;
        }

        $stmt = $pdo->prepare("
            UPDATE schedules SET 
                bus_id = :bus_id, 
                route_id = :route_id, 
                driver_id = :driver_id,
                departure_time = :departure, 
                arrival_time = :arrival, 
                shift = :shift, 
                day_type = :day_type, 
                status = :status
            WHERE id = :id
        ");
        $stmt->execute([
            'bus_id' => $bus_id, 
            'route_id' => $route_id, 
            'driver_id' => $driver_id,
            'departure' => $dep_time, 
            'arrival' => $arr_time, 
            'shift' => $type, 
            'day_type' => $day_type, 
            'status' => $db_status, 
            'id' => $id
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
?>
