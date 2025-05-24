<?php
require 'ConnectionManager.php';

$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Media';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();
} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}

$startDate = isset($_GET['JsonStartDate']) ? $_GET['JsonStartDate'] : '';
$endDate = isset($_GET['JsonEndDate']) ? $_GET['JsonEndDate'] : '';

try {
    // Fetch count of orders
    $countStmt = $pdo->prepare("SELECT * FROM order_table WHERE CancelFlag = 0 AND orderDate BETWEEN :PDOStartDate AND :PDOEndDate");
    
    // Bind parameters
    $countStmt->bindParam(':PDOStartDate', $startDate);
    $countStmt->bindParam(':PDOEndDate', $endDate);
    $countStmt->execute();
    if ($countStmt->rowCount() == 0) {
        echo json_encode(0);
    } else {
        echo json_encode($countStmt->rowCount());
    }
} catch (PDOException $e) {
    echo json_encode("Error Fetching Data: " . $e->getMessage());
}
?>
