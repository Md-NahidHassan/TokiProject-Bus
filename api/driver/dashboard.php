<?php
// API Endpoint: GET /api/driver/dashboard.php
require_once '../config/db.php';

$driver_id = isset($_GET['driver_id']) ? intval($_GET['driver_id']) : 3; // Default demo driver ID

try {
    // 1. Fetch Driver Profile
    $stmtDriver = $pdo->prepare("SELECT id, name, email, phone, license_number, avatar FROM users WHERE id = :id AND role = 'driver'");
    $stmtDriver->execute(['id' => $driver_id]);
    $driver = $stmtDriver->fetch();

    if (!$driver) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Driver profile not found."]);
        exit();
    }

    // 2. Fetch Assigned Bus
    $stmtBus = $pdo->prepare("
        SELECT 
            b.id AS bus_id,
            b.bus_number,
            b.registration_number,
            b.capacity,
            b.status AS bus_status,
            b.current_lat,
            b.current_lng,
            b.speed_kmh,
            r.id AS route_id,
            r.route_name,
            r.start_location,
            r.end_location,
            r.distance_km
        FROM buses b
        LEFT JOIN routes r ON b.route_id = r.id
        WHERE b.driver_id = :driver_id
        LIMIT 1
    ");
    $stmtBus->execute(['driver_id' => $driver_id]);
    $bus = $stmtBus->fetch();

    // 3. Today's Scanned Passengers Count for this driver's bus
    $scanned_count = 0;
    if ($bus) {
        $stmtScan = $pdo->prepare("SELECT COUNT(*) AS total_scanned FROM attendance WHERE bus_id = :bus_id AND DATE(scan_time) = CURDATE()");
        $stmtScan->execute(['bus_id' => $bus['bus_id']]);
        $scanned_count = $stmtScan->fetch()['total_scanned'];
    }

    // 4. Driver's Schedules for Today
    $schedules = [];
    if ($bus) {
        $stmtSched = $pdo->prepare("
            SELECT s.id, s.departure_time, s.arrival_time, s.shift, s.day_type, s.status
            FROM schedules s
            WHERE s.bus_id = :bus_id
            ORDER BY s.departure_time ASC
        ");
        $stmtSched->execute(['bus_id' => $bus['bus_id']]);
        $schedules = $stmtSched->fetchAll();
    }

    http_response_code(200);
    echo json_encode([
        "success" => true,
        "driver" => $driver,
        "assigned_bus" => $bus,
        "today_passengers_scanned" => $scanned_count,
        "schedules" => $schedules
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server Error: " . $e->getMessage()]);
}
