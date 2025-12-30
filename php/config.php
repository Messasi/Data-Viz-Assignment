<?php
// Database configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'mobilematrix_db');
define('DB_USER', 'root');
define('DB_PASS', ''); 
define('DB_CHARSET', 'utf8mb4');

//Get database connection
function getDBConnection() {
    // Create connection
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    
    // Check connection
    if ($conn->connect_error) {
        
        error_log("Database connection failed: " . $conn->connect_error);
        throw new Exception("Database connection failed");
    }
    
    // Set charset to prevent sql injection attacks
    $conn->set_charset(DB_CHARSET);
    
    return $conn;
}