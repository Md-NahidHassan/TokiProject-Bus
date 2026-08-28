<?php
// API Endpoint: POST /api/student/submit_complaint.php
require_once '../config/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method Not Allowed. Use POST."]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

$user_id = isset($data['user_id']) ? intval($data['user_id']) : 4; // Default student ID
$category = isset($data['category']) ? trim($data['category']) : 'General';
$subject = isset($data['subject']) ? trim($data['subject']) : '';
$description = isset($data['description']) ? trim($data['description']) : '';

if (empty($subject) || empty($description)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Subject and Description are required."]);
    exit();
}

try {
    $stmt = $pdo->prepare("
        INSERT INTO complaints (user_id, category, subject, description, status, created_at)
        VALUES (:user_id, :category, :subject, :description, 'pending', NOW())
    ");

    $stmt->execute([
        'user_id' => $user_id,
        'category' => $category,
        'subject' => $subject,
        'description' => $description
    ]);

    $complaint_id = $pdo->lastInsertId();

    http_response_code(201);
    echo json_encode([
        "success" => true,
        "message" => "Complaint submitted successfully.",
        "complaint_id" => $complaint_id
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Failed to submit complaint: " . $e->getMessage()]);
}
