<?php
/**
 * ============================================================
 * NSTU BUS TRACKER - Route Calculator API (PHP Gateway)
 * ============================================================
 * This PHP file acts as a bridge between the JavaScript
 * frontend and the compiled C++ route_calculator binary.
 *
 * Endpoint : GET/POST /api/cpp/route_calculator.php
 * Required : source (int), destination (int)
 * Returns  : JSON with shortest path, distance, time
 *
 * Technology Stack:
 *   HTML5 → JavaScript (React) → PHP (this file) → C++ binary
 * ============================================================
 */

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// -------------------------------------------------------
// Read Input Parameters (GET or POST/JSON)
// -------------------------------------------------------
$source = null;
$destination = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    $source      = isset($body['source'])      ? intval($body['source'])      : null;
    $destination = isset($body['destination']) ? intval($body['destination']) : null;
} else {
    $source      = isset($_GET['source'])      ? intval($_GET['source'])      : null;
    $destination = isset($_GET['destination']) ? intval($_GET['destination']) : null;
}

// Validate input
if ($source === null || $destination === null) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error"   => "Missing required parameters: 'source' and 'destination' (0-11)",
        "example" => "GET ?source=0&destination=8"
    ]);
    exit();
}

if ($source < 0 || $source > 11 || $destination < 0 || $destination > 11) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "error"   => "Stop IDs must be between 0 and 11",
        "stops_info" => [
            "0=NSTU Main Gate", "1=Sonapur Bazar", "2=Companiganj",
            "3=Bashbaria", "4=Maijdee Court", "5=NSTU Campus Gate",
            "6=Begumganj Turn", "7=Jamidar Hat", "8=Chowmuhani Square",
            "9=Admin Building", "10=Academic Block", "11=Dormitory Gate"
        ]
    ]);
    exit();
}

// -------------------------------------------------------
// Locate Compiled C++ Executable
// -------------------------------------------------------
$cpp_dir    = __DIR__;
$exe_linux  = $cpp_dir . '/route_calculator';
$exe_win    = $cpp_dir . '/route_calculator.exe';

// Determine OS and pick executable
if (PHP_OS_FAMILY === 'Windows') {
    $exe = $exe_win;
} else {
    $exe = $exe_linux;
}

// -------------------------------------------------------
// Check if binary exists, otherwise compile it
// -------------------------------------------------------
if (!file_exists($exe)) {
    // Try to compile C++ source automatically (requires g++)
    $cpp_src = $cpp_dir . '/route_calculator.cpp';

    if (!file_exists($cpp_src)) {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "error"   => "C++ source file not found: route_calculator.cpp",
            "hint"    => "Make sure route_calculator.cpp is in /api/cpp/ directory"
        ]);
        exit();
    }

    // Compile command
    if (PHP_OS_FAMILY === 'Windows') {
        $compile_cmd = "g++ -O2 -std=c++17 -o \"{$exe_win}\" \"{$cpp_src}\" 2>&1";
    } else {
        $compile_cmd = "g++ -O2 -std=c++17 -o \"{$exe_linux}\" \"{$cpp_src}\" 2>&1";
    }

    $compile_output = shell_exec($compile_cmd);

    if (!file_exists($exe)) {
        http_response_code(500);
        echo json_encode([
            "success"          => false,
            "error"            => "Failed to compile C++ route_calculator",
            "compile_output"   => $compile_output,
            "hint"             => "Make sure g++ (MinGW on Windows) is installed and in system PATH"
        ]);
        exit();
    }
}

// -------------------------------------------------------
// Execute C++ Binary with Stop IDs
// -------------------------------------------------------

// Sanitize inputs (already validated as integers, but double-check)
$safe_source = escapeshellarg((string)intval($source));
$safe_dest   = escapeshellarg((string)intval($destination));

if (PHP_OS_FAMILY === 'Windows') {
    $command = "\"{$exe_win}\" {$safe_source} {$safe_dest} 2>&1";
} else {
    $command = "\"{$exe_linux}\" {$safe_source} {$safe_dest} 2>&1";
}

// Execute with timeout protection
$start_time = microtime(true);
$output     = shell_exec($command);
$exec_time_ms = round((microtime(true) - $start_time) * 1000, 2);

// -------------------------------------------------------
// Process Output
// -------------------------------------------------------
if (empty($output)) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error"   => "C++ program produced no output. Check if binary is executable.",
        "command" => (PHP_OS_FAMILY === 'Windows') ? basename($exe_win) : basename($exe_linux)
    ]);
    exit();
}

// Parse JSON output from C++
$result = json_decode($output, true);

if ($result === null) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error"   => "Failed to parse C++ output as JSON",
        "raw_output" => $output
    ]);
    exit();
}

// Add metadata to response
$result['meta'] = [
    "algorithm"     => "Dijkstra's Shortest Path",
    "language"      => "C++17",
    "execution_ms"  => $exec_time_ms,
    "requested_by"  => "NSTU Bus Tracker PHP Gateway",
    "timestamp"     => date('Y-m-d H:i:s')
];

// Return the final JSON result
http_response_code($result['success'] ? 200 : 404);
echo json_encode($result, JSON_PRETTY_PRINT);
