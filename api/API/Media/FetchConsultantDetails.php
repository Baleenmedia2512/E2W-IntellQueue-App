<?php
require 'ConnectionManager.php';
$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Test';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();
} catch(PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}

$consultant_id = $_GET['JsonConsultantID'];

// Prepare the SQL statement to fetch the client details based on the selected client contact
$sql = "SELECT * FROM `consultant_table` WHERE `CId` = :PDOConsultantID";

$stmt = $pdo->prepare($sql);
$stmt->bindParam(':PDOConsultantID', $consultant_id);
$stmt->execute();

// Fetch the selected client details and store them in an array
$consultantdetails = $stmt->fetch(PDO::FETCH_ASSOC);

header('Content-Type: application/json');
echo json_encode($consultantdetails);

// Close the database connection
$pdo = null;
?>
