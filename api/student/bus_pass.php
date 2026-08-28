<?php
// API Endpoint: GET /api/student/bus_pass.php
require_once '../config/db.php';

$student_id = isset($_GET['student_id']) ? intval($_GET['student_id']) : 4; // Default student ID

try {
    $stmt = $pdo->prepare("
        SELECT id, name, email, department, student_id, phone, status, created_at
        FROM users 
        WHERE id = :id AND role = 'student'
    ");
    $stmt->execute(['id' => $student_id]);
    $student = $stmt->fetch();

    if (!$student) {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Student pass not found."]);
        exit();
    }

    // Generate unique bus pass verification code
    $pass_code = "NSTU-PASS-" . strtoupper(md5($student['id'] . $student['student_id']));
    $qr_data = json_encode([
        'pass_code' => $pass_code,
        'student_id' => $student['student_id'],
        'name' => $student['name'],
        'department' => $student['department'],
        'status' => 'VERIFIED_ACTIVE'
    ]);

    http_response_code(200);
    echo json_encode([
        "success" => true,
        "pass_details" => [
            "pass_code" => $pass_code,
            "student_name" => $student['name'],
            "student_id" => $student['student_id'],
            "department" => $student['department'],
            "phone" => $student['phone'],
            "valid_until" => date('Y-12-31'), // Valid till end of year
            "status" => "ACTIVE",
            "qr_string" => $qr_data
        ]
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Error loading bus pass: " . $e->getMessage()]);
}
