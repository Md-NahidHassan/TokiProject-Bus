<?php
// API Endpoint: GET / POST /api/admin/manage_notifications.php
require_once '../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"), true);

if ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT * FROM notifications ORDER BY created_at DESC");
        $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $formatted = array_map(function($n) {
            $diff = time() - strtotime($n['created_at']);
            if ($diff < 3600) $timeAgo = floor($diff/60) . ' min ago';
            elseif ($diff < 86400) $timeAgo = floor($diff/3600) . ' hours ago';
            else $timeAgo = floor($diff/86400) . ' days ago';

            return [
                'id' => $n['id'],
                'title' => $n['title'],
                'message' => $n['message'],
                'type' => $n['type'],
                'target_role' => $n['target_role'],
                'time' => $timeAgo,
                'priority' => 'medium',
                'read' => ($diff > 86400),
                'created_at' => $n['created_at']
            ];
        }, $notifications);

        echo json_encode(["success" => true, "data" => $formatted]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
    exit();
}

if ($method === 'POST') {
    $title = $data['title'] ?? '';
    $message = $data['message'] ?? '';
    $type = $data['type'] ?? 'announcement';
    $target_role = $data['target_role'] ?? 'all';

    if (empty($title) || empty($message)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Title and message are required."]);
        exit();
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO notifications (title, message, type, target_role) VALUES (?, ?, ?, ?)");
        $stmt->execute([$title, $message, $type, $target_role]);
        echo json_encode(["success" => true, "message" => "Notification sent!", "id" => $pdo->lastInsertId()]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
    exit();
}

if ($method === 'DELETE') {
    $id = $_GET['id'] ?? 0;
    try {
        $stmt = $pdo->prepare("DELETE FROM notifications WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(["success" => true]);
    } catch (Exception $e) { echo json_encode(["success" => false]); }
    exit();
}

http_response_code(405);
echo json_encode(["success" => false, "message" => "Method Not Allowed."]);
