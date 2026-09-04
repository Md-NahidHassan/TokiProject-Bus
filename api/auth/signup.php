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
$email = (!empty($data['email']) && trim($data['email']) !== '') ? trim($data['email']) : null;
$phone = (!empty($data['phone']) && trim($data['phone']) !== '') ? trim($data['phone']) : null;
$student_id = (!empty($data['studentId']) && trim($data['studentId']) !== '') ? trim($data['studentId']) : null;
$password = isset($data['password']) ? $data['password'] : '';
$role = !empty($data['role']) ? trim($data['role']) : 'student';
$department = !empty($data['department']) ? trim($data['department']) : 'General';

// Validate role against enum values
$allowed_roles = ['super_admin', 'transport_admin', 'driver', 'student'];
if (!in_array($role, $allowed_roles)) {
    $role = 'student';
}

if (empty($name) || empty($password) || (empty($email) && empty($phone) && empty($student_id))) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Name, password, and at least one identifier (Email, Phone, or Student ID) are required."]);
    exit();
}

try {
    // Check duplicates dynamically based on provided identifiers
    $conditions = [];
    $params = [];
    if (!empty($email)) {
        $conditions[] = "email = :email";
        $params['email'] = $email;
    }
    if (!empty($phone)) {
        $conditions[] = "phone = :phone";
        $params['phone'] = $phone;
    }
    if (!empty($student_id)) {
        $conditions[] = "student_id = :student_id";
        $params['student_id'] = $student_id;
    }

    if (!empty($conditions)) {
        $checkQuery = "SELECT id, email, phone, student_id FROM users WHERE " . implode(" OR ", $conditions) . " LIMIT 1";
        $stmt = $pdo->prepare($checkQuery);
        $stmt->execute($params);
        $existing = $stmt->fetch();
        
        if ($existing) {
            if (!empty($email) && strcasecmp($existing['email'] ?? '', $email) === 0) {
                $msg = 'Email already registered';
            } else if (!empty($phone) && ($existing['phone'] ?? '') === $phone) {
                $msg = 'Phone number already registered';
            } else if (!empty($student_id) && strcasecmp($existing['student_id'] ?? '', $student_id) === 0) {
                $msg = 'Student ID already registered';
            } else {
                $msg = 'An account with these details already exists';
            }
            http_response_code(409);
            echo json_encode(["success" => false, "message" => $msg]);
            exit();
        }
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
