<?php
// Set response headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Allow cross-origin requests

// Include database connection
require_once 'config.php';

// Get database connection
$conn = getDBConnection();

// Check if specific ID requested (optional for single phone view)
$id = isset($_GET['id']) ? intval($_GET['id']) : null;

// Check if brand filter applied
$brand = isset($_GET['brand']) ? $_GET['brand'] : null;

// Check if price filter applied
$maxPrice = isset($_GET['maxPrice']) ? floatval($_GET['maxPrice']) : null;

// Check if RAM filter applied  
$minRam = isset($_GET['minRam']) ? intval($_GET['minRam']) : null;

try {
    // If id provided return single phone
    if ($id) {
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
        $stmt->close();
        
    } else {
        // Return all phones 
        $sql = "SELECT * FROM phones WHERE 1=1";
        $params = [];
        $types = "";
        
        // Add brand filter 
        if ($brand) {
            $sql .= " AND brand = ?"; // prepared statement placeholder
            $params[] = $brand; //store parameter value
            $types .= "s"; // the type of parameter
        }
        
        // Add price filter 
        if ($maxPrice) {
            $sql .= " AND price <= ?";
            $params[] = $maxPrice;
            $types .= "d";
        }
        
        // Add RAM filter 
        if ($minRam) {
            $sql .= " AND ram_gb >= ?";
            $params[] = $minRam;
            $types .= "i";
        }
        
        // Order by price ascending 
        $sql .= " ORDER BY price ASC";
        
        // Prepare statement
        if (count($params) > 0) {
            $stmt = $conn->prepare($sql);
            
            // Bind parameters dynamically
            $bind_params = [$types];// first element is the types string
            foreach ($params as $key => $value) { 
                $bind_params[] = &$params[$key]; //bind by reference
            }
            call_user_func_array([$stmt, 'bind_param'], $bind_params); // Dont know how many vlaues will be bound
            
            $stmt->execute();
            $result = $stmt->get_result();
        } else {
            // No filters, execute directly
            $result = $conn->query($sql);
        }
        
        // Fetch all phones
        $phones = [];
        while ($row = $result->fetch_assoc()) {
            $phones[] = $row;
        }
        
        // Return JSON array
        echo json_encode($phones);
        
        if (isset($stmt)) {
            $stmt->close();
        }
    }
    
} catch (Exception $e) {
    // Handle errors gracefully
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}

// Close connection
$conn->close();
?>