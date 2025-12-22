<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'config.php';
$conn = getDBConnection();

// Find 'id' parameter in a case-insensitive way
$id = null;
foreach ($_GET as $key => $value) {
    if (strtolower($key) === 'id') {
        $id = intval($value);
        break;
    }
}

if (!$id) {
    echo json_encode(['error' => 'No ID provided']);
    exit;
}

// Prepare and execute the statement
$stmt = $conn->prepare("SELECT * FROM phones WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();

$phone = $result->fetch_assoc();

if (!$phone) {
    echo json_encode(['error' => 'Phone not found']);
    exit;
}

echo json_encode($phone);
$conn->close();
