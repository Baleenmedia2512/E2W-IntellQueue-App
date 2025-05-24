<?php
require 'ConnectionManager.php';

// Set error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Set the database name
$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Test';


// Allow access from all origins
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    // Connect to the database
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();

    // Get the username and password from the request
    $userName = isset($_GET['JsonUserName']) ? trim($_GET['JsonUserName']) : '';
    $password = isset($_GET['JsonPassword']) ? trim($_GET['JsonPassword']) : '';

    if ($userName !== "" && $password !== "") {
        // Prepare and execute the query
        $stmt = $pdo->prepare("SELECT * FROM `employee_table` WHERE `userName` = :userName AND `password` = :password");
        $stmt->bindParam(':userName', $userName);
        $stmt->bindParam(':password', $password);
        $stmt->execute();

        // Check the number of rows returned
        if ($stmt->rowCount() == 0) {
            echo json_encode('Wrong Details');
        } else {
        // Fetch AppRights after successful login
            $employeeData = $stmt->fetch(PDO::FETCH_ASSOC);
            $appRights = $employeeData['AppRights'];
            echo json_encode(['status' => 'Login Successfully', 'appRights' => $appRights]);
        }
    } else {
        echo json_encode('Please enter Valid Details!!');
    }
} catch (Exception $e) {
    // Catch and display any errors
    echo json_encode('Message: ' . $e->getMessage());
}
?>
