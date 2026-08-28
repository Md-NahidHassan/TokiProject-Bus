<?php
// API Endpoint: POST /api/driver/scan_student_pass.php
require_once '../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method Not Allowed. Use POST."]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

$student_id_str = isset($data['student_id']) ? trim($data['student_id']) : '';
$bus_id = isset($data['bus_id']) ? intval($data['bus_id']) : 1;
$stop_name = isset($data['stop_name']) ? trim($data['stop_name']) : 'Boarding Stop';

if (empty($student_id_str)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Student ID string is required."]);
    exit();
}

try {
    // Find Student by Student ID
    $stmtStudent = $pdo->prepare("SELECT id, name, department, status FROM users WHERE (student_id = :sid OR email = :sid) AND role = 'student' LIMIT 1");
    $stmtStudent->execute(['sid' => $student_id_str]);
    $student = $stmtStudent->fetch();

    if (!$student) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Invalid Student Pass. No record found."]);
        exit();
    }

    if ($student['status'] !== 'active') {
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "Bus Pass Blocked. Student status: " . $student['status']]);
        exit();
    }

    // Insert attendance log
    $stmtLog = $pdo->prepare("
        INSERT INTO attendance (student_id, bus_id, stop_name, scan_time, status)
        VALUES (:student_db_id, :bus_id, :stop_name, NOW(), 'present')
    ");

    $stmtLog->execute([
        'student_db_id' => $student['id'],
        'bus_id' => $bus_id,
        'stop_name' => $stop_name
    ]);

    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Student Pass Scanned Successfully. Access Granted!",
        "student" => [
            "name" => $student['name'],
            "department" => $student['department'],
            "status" => "VERIFIED"
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Pass Verification Failed: " . $e->getMessage()]);
}
