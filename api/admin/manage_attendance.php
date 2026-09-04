<?php
// API Endpoint: GET /api/admin/manage_attendance.php
require_once '../config/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $pdo->query("
            SELECT a.*, u.name AS student_name, u.student_id AS student_code, u.department,
                   b.bus_number
            FROM attendance a
            LEFT JOIN users u ON a.student_id = u.id
            LEFT JOIN buses b ON a.bus_id = b.id
            ORDER BY a.scan_time DESC
            LIMIT 100
        ");
        $records = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $formatted = array_map(function($a) {
            return [
                'id' => $a['id'],
                'student' => $a['student_name'] ?? 'Unknown',
                'studentId' => $a['student_code'] ?? 'N/A',
                'department' => $a['department'] ?? 'N/A',
                'bus' => $a['bus_number'] ?? 'N/A',
                'stop' => $a['stop_name'],
                'date' => date('Y-m-d', strtotime($a['scan_time'])),
                'morningIn' => date('h:i A', strtotime($a['scan_time'])),
                'afternoonOut' => null,
                'status' => $a['status']
            ];
        }, $records);

        // Get students with attendance summaries
        $stmtStudents = $pdo->query("
            SELECT u.id, u.name, u.department, u.student_id,
                   COUNT(a.id) AS total_scans,
                   SUM(CASE WHEN a.status = 'present' THEN 1 ELSE 0 END) AS present_count
            FROM users u
            LEFT JOIN attendance a ON u.id = a.student_id
            WHERE u.role = 'student'
            GROUP BY u.id
            ORDER BY u.name
        ");
        $students = $stmtStudents->fetchAll(PDO::FETCH_ASSOC);

        $studentSummary = array_map(function($s) {
            $total = max($s['total_scans'], 1);
            $rate = round(($s['present_count'] / $total) * 100);
            return [
                'id' => $s['id'],
                'name' => $s['name'],
                'studentId' => $s['student_id'] ?? 'N/A',
                'dept' => $s['department'] ?? 'N/A',
                'bus' => 'N/A',
                'attendance' => $rate,
                'status' => $rate >= 75 ? 'active' : 'inactive'
            ];
        }, $students);

        echo json_encode([
            "success" => true, 
            "data" => $formatted, 
            "students" => $studentSummary,
            "stats" => [
                "total" => count($records),
                "present" => count(array_filter($records, fn($r) => $r['status'] === 'present')),
                "absent" => count(array_filter($records, fn($r) => $r['status'] === 'absent')),
                "late" => count(array_filter($records, fn($r) => $r['status'] === 'late'))
            ]
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => $e->getMessage()]);
    }
    exit();
}

http_response_code(405);
echo json_encode(["success" => false, "message" => "Method Not Allowed."]);
