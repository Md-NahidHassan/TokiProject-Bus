<?php
// API Endpoint: POST /api/auth/signup.php
require_once '../config/db.php';

// Only allow POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method Not Allowed. Use POST."]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

$name = isset($data['name']) ? trim($data['name']) : '';
$email = isset($data['email']) ? trim($data['email']) : null;
$phone = isset($data['phone']) ? trim($data['phone']) : null;
$student_id = isset($data['studentId']) ? trim($data['studentId']) : null;
$password = isset($data['password']) ? $data['password'] : '';
$role = isset($data['role']) ? trim($data['role']) : 'student';
$department = isset($data['department']) ? trim($data['department']) : 'General';

if (empty($name) || empty($password) || (empty($email) && empty($phone) && empty($student_id))) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Required fields missing."]);
    exit();
}

try {
    // Check duplicates
    $checkQuery = "SELECT id, email, phone, student_id FROM users WHERE 
                   (email = :email AND email IS NOT NULL AND email != '') OR 
                   (phone = :phone AND phone IS NOT NULL AND phone != '') OR 
                   (student_id = :student_id AND student_id IS NOT NULL AND student_id != '') LIMIT 1";
    $stmt = $pdo->prepare($checkQuery);
    $stmt->execute([
        'email' => $email,
        'phone' => $phone,
        'student_id' => $student_id
    ]);
    
    $existing = $stmt->fetch();
    if ($existing) {
        if (!empty($email) && $existing['email'] === $email) {
            $msg = 'Email already registered';
        } else if (!empty($phone) && $existing['phone'] === $phone) {
            $msg = 'Phone already registered';
        } else {
            $msg = 'Student ID already registered';
        }
        http_response_code(409);
        echo json_encode(["success" => false, "message" => $msg]);
        exit();
    }

    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    $insertQuery = "INSERT INTO users (name, email, phone, student_id, password, role, department, status) 
                    VALUES (:name, :email, :phone, :student_id, :password, :role, :department, 'active')";
    $stmt = $pdo->prepare($insertQuery);
    $stmt->execute([
        'name' => $name,
        'email' => $email,
        'phone' => $phone,
        'student_id' => $student_id,
        'password' => $hashedPassword,
        'role' => $role,
        'department' => $department
    ]);

    $userId = $pdo->lastInsertId();

    $user = [
        'id' => $userId,
        'name' => $name,
        'email' => $email,
        'phone' => $phone,
        'student_id' => $student_id,
        'role' => $role,
        'department' => $department,
        'status' => 'active'
    ];

    $token = base64_encode(json_encode([
        'id' => $userId,
        'email' => $email,
        'phone' => $phone,
        'student_id' => $student_id,
        'role' => $role,
        'exp' => time() + (86400 * 7)
    ]));

    http_response_code(201);
    echo json_encode([
        "success" => true,
        "message" => "Account created successfully",
        "token" => $token,
        "user" => $user
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
}
?>
