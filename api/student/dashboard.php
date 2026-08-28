<?php
// API Endpoint: GET /api/student/dashboard.php
require_once '../config/db.php';

$student_id = isset($_GET['student_id']) ? intval($_GET['student_id']) : 4; // Default demo student

try {
    // 1. Get Student Info
    $stmtUser = $pdo->prepare("SELECT id, name, email, department, student_id, phone, avatar FROM users WHERE id = :id AND role = 'student'");
    $stmtUser->execute(['id' => $student_id]);
    $student = $stmtUser->fetch();

    if (!$student) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Student profile not found."]);
        exit();
    }

    // 2. Active Buses Count
    $stmtBuses = $pdo->query("SELECT COUNT(*) AS active_buses FROM buses WHERE status IN ('active', 'in_transit')");
    $activeBuses = $stmtBuses->fetch()['active_buses'];

    // 3. Upcoming Schedules
    $stmtSched = $pdo->query("
        SELECT 
            s.id,
            b.bus_number AS bus,
            r.route_name AS route,
            r.start_location,
            r.end_location,
            s.departure_time,
            s.arrival_time,
            s.shift
        FROM schedules s
        JOIN buses b ON s.bus_id = b.id
        JOIN routes r ON s.route_id = r.id
        WHERE s.status = 'scheduled'
        ORDER BY s.departure_time ASC
        LIMIT 5
    ");
    $schedules = $stmtSched->fetchAll();

    // 4. Student Complaints Summary
    $stmtComplaints = $pdo->prepare("
        SELECT id, category, subject, status, created_at 
        FROM complaints 
        WHERE user_id = :uid 
        ORDER BY created_at DESC 
        LIMIT 5
    ");
    $stmtComplaints->execute(['uid' => $student_id]);
    $complaints = $stmtComplaints->fetchAll();

    // 5. Active Notifications
    $stmtNotif = $pdo->query("
        SELECT id, title, message, type, created_at 
        FROM notifications 
        WHERE target_role IN ('all', 'student') 
        ORDER BY created_at DESC 
        LIMIT 5
    ");
    $notifications = $stmtNotif->fetchAll();

    http_response_code(200);
    echo json_encode([
        "success" => true,
        "student" => $student,
        "active_buses_count" => $activeBuses,
        "upcoming_schedules" => $schedules,
        "my_complaints" => $complaints,
        "notifications" => $notifications
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server Error: " . $e->getMessage()]);
}
