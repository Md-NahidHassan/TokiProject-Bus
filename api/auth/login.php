<?php
// API Endpoint: POST /api/auth/login.php
require_once '../config/db.php';

// Only allow POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method Not Allowed. Use POST."]);
    exit();
}

// Read raw JSON input
$data = json_decode(file_get_contents("php://input"), true);

$identifier = isset($data['email']) ? trim($data['email']) : (isset($data['identifier']) ? trim($data['identifier']) : '');
$password = isset($data['password']) ? trim($data['password']) : '';

if (empty($identifier) || empty($password)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Identifier (Email/Phone/Student ID) and Password are required."]);
    exit();
}

try {
    // Find user by email, phone, or student_id
    $stmt = $pdo->prepare("SELECT id, name, email, password, role, phone, department, student_id, license_number, avatar, status FROM users WHERE (email = :id1 AND email != '') OR (phone = :id2 AND phone != '') OR (student_id = :id3 AND student_id != '') LIMIT 1");
    $stmt->execute([
        'id1' => $identifier,
        'id2' => $identifier,
        'id3' => $identifier
    ]);
    $user = $stmt->fetch();

    // Verification check (For demo, also support password check or fallback demo logic)
    if (!$user) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "User not found with this email."]);
        exit();
    }

    // Verify password hash OR demo password check
    $is_valid_password = password_verify($password, $user['password']) || $password === 'password' || $password === '123456';

    if (!$is_valid_password) {
        http_response_code(401);
        echo json_encode(["success" => false, "message" => "Invalid email or password."]);
        exit();
    }

    if ($user['status'] !== 'active') {
        http_response_code(403);
        echo json_encode(["success" => false, "message" => "Your account is currently " . $user['status'] . "."]);
        exit();
    }

    // Remove hashed password from output
    unset($user['password']);

    // Generate pseudo JWT token for API session
    $token = base64_encode(json_encode([
        'id' => $user['id'],
        'email' => $user['email'],
        'role' => $user['role'],
        'exp' => time() + (86400 * 7) // 7 days token
    ]));

    http_response_code(200);
    echo json_encode([
        "success" => true,
        "message" => "Login Successful",
        "token" => $token,
        "user" => $user
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Server Error: " . $e->getMessage()]);
}
