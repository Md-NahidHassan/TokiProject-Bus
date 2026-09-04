<?php
require_once 'config/db.php';
$result = [];
try {
    $tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    foreach ($tables as $t) {
        $cols = $pdo->query("DESCRIBE $t")->fetchAll(PDO::FETCH_ASSOC);
        $result[$t] = $cols;
    }
    file_put_contents('schema_all.json', json_encode($result, JSON_PRETTY_PRINT));
    echo "Done. " . count($tables) . " tables found.";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
