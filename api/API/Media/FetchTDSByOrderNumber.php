<?php
require 'ConnectionManager.php';

$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Media';
$orderNumber = isset($_GET['orderNumber']) ? $_GET['orderNumber'] : '';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header("Content-Type: application/json");

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();

    // Fetch vendor name based on order number
    $stmt = $pdo->prepare("SELECT vendorName FROM order_table WHERE OrderNumber = :orderNumber");
    $stmt->bindParam(':orderNumber', $orderNumber, PDO::PARAM_STR);
    $stmt->execute();
    $vendor = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($vendor) {
        // Fetch TDS percentage based on vendor name
        $stmt2 = $pdo->prepare("SELECT tdsApplicabilityPercentage FROM vendor_table WHERE vendorName = :vendorName");
        $stmt2->bindParam(':vendorName', $vendor['vendorName'], PDO::PARAM_STR);
        $stmt2->execute();
        $tdsData = $stmt2->fetch(PDO::FETCH_ASSOC);

        if ($tdsData) {
            echo json_encode(["tdsApplicabilityPercentage" => $tdsData['tdsApplicabilityPercentage']]);
        } else {
            echo json_encode(["error" => "TDS percentage not found for vendor"]);
        }
    } else {
        echo json_encode(["error" => "Vendor not found for order number"]);
    }
} catch (PDOException $e) {
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
}
?>
