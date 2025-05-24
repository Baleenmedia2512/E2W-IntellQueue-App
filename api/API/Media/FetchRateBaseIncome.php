<?php
require 'ConnectionManager.php';

$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Media';


header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();
} catch(PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}

$startDate = isset($_GET['JsonStartDate']) ? $_GET['JsonStartDate'] : '';
$endDate = isset($_GET['JsonEndDate']) ? $_GET['JsonEndDate'] : '';

try{
    $stmt = $pdo->prepare("SELECT
    ot.Card,
    SUM(ft.Amount) AS total_amount
FROM
    financial_transaction_table ft
JOIN
    order_table ot ON ft.orderNumber = ot.orderNumber
WHERE
	ot.OrderNumber > 0
    AND ot.OrderNumber < 100000
    AND ft.ValidStatus = 'Valid'
    AND DATE(ft.TransactionDate) BETWEEN :PDOStartDate AND :PDOEndDate
    AND ft.TransactionType = 'income'
GROUP BY ot.Card;");
     $stmt->bindParam(':PDOStartDate', $startDate);
    $stmt->bindParam(':PDOEndDate', $endDate);
    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($results);
} catch (PDOException $e) {
        echo json_encode("Error Inserting Data: " . $e->getMessage());
}
?>
