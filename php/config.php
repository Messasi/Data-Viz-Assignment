<?php
// Database information 
$host = 'localhost';
$db = 'mobilematrix_db';
$user = 'root';
$pass = '';
$charset = 'utf8mb4';

function getDBConnection() {
    global $host, $db, $user, $pass; //  global variables inside function

    $conn = new mysqli($host, $user, $pass, $db);

    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    return $conn;   
}