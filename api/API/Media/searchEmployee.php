<?php
require 'ConnectionManager.php'; // Include the connection manager file

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json");

try {
    // Connect to the database
    $dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'BaleenMedia';
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();

    // Get the search term from the query parameter
    $searchTerm = isset($_GET['searchTerm']) ? $_GET['searchTerm'] : '';
    $fetchDetails = isset($_GET['fetchDetails']) ? $_GET['fetchDetails'] : false;

    if ($fetchDetails === 'true') {
        // Fetch full details of the selected employee by username or name
        $stmt = $pdo->prepare("SELECT * FROM employee_table WHERE userName = :searchTerm OR name = :searchTerm LIMIT 1");
        $stmt->bindParam(':searchTerm', $searchTerm);
        $stmt->execute();

        $employeeDetails = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($employeeDetails) {
            echo json_encode($employeeDetails); // Return employee details
        } else {
            echo json_encode(["error" => "Employee not found"]);
        }
    } else {
        // Return list of employees matching the search term
        $stmt = $pdo->prepare("SELECT name, userName FROM employee_table WHERE name LIKE :searchTerm OR userName LIKE :searchTerm LIMIT 10");
        $searchQuery = "%$searchTerm%";
        $stmt->bindParam(':searchTerm', $searchQuery);
        $stmt->execute();

        $employees = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if ($employees) {
            echo json_encode($employees); // Return the list of matching employees
        } else {
            echo json_encode([]); // Return an empty array if no matches are found
        }
    }
} catch (PDOException $e) {
    echo json_encode(["error" => "Error fetching employee details: " . $e->getMessage()]);
}
?>
