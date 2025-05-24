<?php
require 'ConnectionManager.php';
$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Media';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();
    $rateName = $_GET['JsonRateName'];
    $adType = $_GET['JsonAdType'];
    $adCategory = $_GET['JsonAdCategory'];
    $VendorName = $_GET['JsonVendorName'];

    $stmt = $pdo -> prepare("SELECT rateId FROM rate_table WHERE rateName = :rateName AND adType = :adType AND adCategory =:adCategory And VendorName = :VendorName");
    $stmt->bindParam(':rateName', $rateName);
    $stmt->bindParam(':adType', $adType);
    $stmt->bindParam(':adCategory', $adCategory);
    $stmt->bindParam(':VendorName', $VendorName);
    $stmt->execute();

    // Fetch the results
    $results = $stmt->fetch();

    // Output the results as JSON (you can modify this part based on your needs)
    echo json_encode($results["rateId"]);
} catch (PDOException $e) {
    echo json_encode("Error calling stored procedure: " . $e->getMessage());
}