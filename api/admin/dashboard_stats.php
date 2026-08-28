<?php
// API Endpoint: GET /api/admin/dashboard_stats.php
require_once '../config/db.php';

try {
    // 1. Bus counts
    $stmtTotalBuses = $pdo->query("SELECT COUNT(*) AS total FROM buses");
    $totalBuses = $stmtTotalBuses->fetch()['total'];

    $stmtActiveBuses = $pdo->query("SELECT COUNT(*) AS total FROM buses WHERE status IN ('active', 'in_transit')");
    $activeBuses = $stmtActiveBuses->fetch()['total'];

    // 2. User counts
    $stmtStudents = $pdo->query("SELECT COUNT(*) AS total FROM users WHERE role = 'student'");
    $totalStudents = $stmtStudents->fetch()['total'];

    $stmtDrivers = $pdo->query("SELECT COUNT(*) AS total FROM users WHERE role = 'driver'");
    $totalDrivers = $stmtDrivers->fetch()['total'];

    // 3. Complaints
    $stmtComplaints = $pdo->query("SELECT COUNT(*) AS total FROM complaints WHERE status = 'pending'");
    $pendingComplaints = $stmtComplaints->fetch()['total'];

    // 4. Routes
    $stmtRoutes = $pdo->query("SELECT COUNT(*) AS total FROM routes WHERE status = 'active'");
    $totalRoutes = $stmtRoutes->fetch()['total'];

    // 5. Today scans
    $stmtScans = $pdo->query("SELECT COUNT(*) AS total FROM attendance WHERE DATE(scan_time) = CURDATE()");
    $todayScans = $stmtScans->fetch()['total'];

    http_response_code(200);
    echo json_encode([
        "success" => true,
        "stats" => [
            "total_buses" => $totalBuses,
            "active_buses" => $activeBuses,
            "total_students" => $totalStudents,
            "total_drivers" => $totalDrivers,
            "pending_complaints" => $pendingComplaints,
            "total_routes" => $totalRoutes,
            "today_scans" => $todayScans
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server Error: " . $e->getMessage()]);
}
