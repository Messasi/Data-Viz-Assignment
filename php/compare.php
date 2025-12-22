<?php

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'config.php';
$conn = getDBConnection();

// Check for 'ids' parameter (case-insensitive)
$ids_param = null;
foreach ($_GET as $key => $value) {
    if (strtolower($key) === 'ids') {
        $ids_param = $value;
        break;
    }
}

if (!$ids_param) {
    echo json_encode(['error' => 'No IDs provided']);
    exit;
}

// Split and sanitize IDs
$ids_raw = explode(',', $ids_param);
$ids = [];
foreach ($ids_raw as $i) {
    $i = intval($i);
    if ($i > 0) $ids[] = $i;
}

if (count($ids) === 0) {
    echo json_encode(['error' => 'No valid IDs provided']);
    exit;
}

// Prepare statement dynamically
$placeholders = implode(',', array_fill(0, count($ids), '?'));
$sql = "SELECT * FROM phones WHERE id IN ($placeholders)";
$stmt = $conn->prepare($sql);

// Bind parameters dynamically
$types = str_repeat('i', count($ids));
$params = array_merge([$types], $ids);
$refs = [];
foreach ($params as $key => $value) $refs[$key] = &$params[$key];
call_user_func_array([$stmt, 'bind_param'], $refs);

$stmt->execute();
$result = $stmt->get_result();

$phones = [];
while ($row = $result->fetch_assoc()) {
    $phones[] = $row;
}

echo json_encode($phones);
$conn->close();
