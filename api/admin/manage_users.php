<?php
// API Endpoint: GET / POST /api/admin/manage_users.php
require_once '../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $role = isset($_GET['role']) ? trim($_GET['role']) : '';
    
    try {
        if (!empty($role)) {
            $stmt = $pdo->prepare("SELECT id, name, email, role, phone, department, student_id, license_number, status, created_at FROM users WHERE role = :role ORDER BY id DESC");
            $stmt->execute(['role' => $role]);
        } else {
            $stmt = $pdo->query("SELECT id, name, email, role, phone, department, student_id, license_number, status, created_at FROM users ORDER BY id DESC");
        }

        $users = $stmt->fetchAll();

        http_response_code(200);
        echo json_encode(["success" => true, "count" => count($users), "data" => $users]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error fetching users: " . $e->getMessage()]);
    }
    exit();
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    $name = isset($data['name']) ? trim($data['name']) : '';
    $email = isset($data['email']) ? trim($data['email']) : '';
    $password = isset($data['password']) ? trim($data['password']) : '123456';
    $role = isset($data['role']) ? trim($data['role']) : 'student';
    $phone = isset($data['phone']) ? trim($data['phone']) : '';
    $department = isset($data['department']) ? trim($data['department']) : '';
    $student_id = isset($data['student_id']) ? trim($data['student_id']) : null;
    $license_number = isset($data['license_number']) ? trim($data['license_number']) : null;

    if (empty($name) || empty($email)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Name and Email are required."]);
        exit();
    }

    $hashed_password = password_hash($password, PASSWORD_BCRYPT);

    try {
        $stmt = $pdo->prepare("
            INSERT INTO users (name, email, password, role, phone, department, student_id, license_number, status)
            VALUES (:name, :email, :password, :role, :phone, :department, :student_id, :license_number, 'active')
        ");
        $stmt->execute([
            'name' => $name,
            'email' => $email,
            'password' => $hashed_password,
            'role' => $role,
            'phone' => $phone,
            'department' => $department,
            'student_id' => $student_id,
            'license_number' => $license_number
        ]);

        http_response_code(201);
        echo json_encode(["success" => true, "message" => "User account created successfully.", "user_id" => $pdo->lastInsertId()]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error creating user: " . $e->getMessage()]);
    }
    exit();
}

http_response_code(405);
echo json_encode(["success" => false, "message" => "Method Not Allowed."]);
