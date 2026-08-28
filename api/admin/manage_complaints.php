<?php
// API Endpoint: GET / POST /api/admin/manage_complaints.php
require_once '../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $pdo->query("
            SELECT c.*, u.name AS student_name, u.email AS student_email, u.department, u.phone
            FROM complaints c
            JOIN users u ON c.user_id = u.id
            ORDER BY c.created_at DESC
        ");
        $complaints = $stmt->fetchAll();

        http_response_code(200);
        echo json_encode(["success" => true, "count" => count($complaints), "data" => $complaints]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error fetching complaints: " . $e->getMessage()]);
    }
    exit();
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);

    $complaint_id = isset($data['complaint_id']) ? intval($data['complaint_id']) : 0;
    $status = isset($data['status']) ? trim($data['status']) : 'resolved'; // 'pending' | 'in_investigation' | 'resolved' | 'dismissed'

    if ($complaint_id <= 0) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Complaint ID is required."]);
        exit();
    }

    try {
        $stmt = $pdo->prepare("UPDATE complaints SET status = :status WHERE id = :id");
        $stmt->execute(['status' => $status, 'id' => $complaint_id]);

        http_response_code(200);
        echo json_encode(["success" => true, "message" => "Complaint status updated to " . $status]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Error updating complaint: " . $e->getMessage()]);
    }
    exit();
}

http_response_code(405);
echo json_encode(["success" => false, "message" => "Method Not Allowed."]);
