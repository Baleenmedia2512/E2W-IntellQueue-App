<?php
require 'ConnectionManager.php';
$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Media';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();

    $startDate = isset($_GET['JsonStartDate']) ? $_GET['JsonStartDate'] : '';
    $endDate = isset($_GET['JsonEndDate']) ? $_GET['JsonEndDate'] : '';

    // Fetch the total order amount and finance amount
    // $stmt = $pdo->prepare("
    //     SELECT 
    //         (SELECT SUM(o.Receivable) 
    //          FROM `order_table` o 
    //          WHERE o.OrderNumber > 0 
    //            AND o.OrderNumber < 100000
    //            AND o.CancelFlag = 0 
    //            AND o.OrderDate BETWEEN :PDOStartDate AND :PDOEndDate
    //         ) as order_amount, 
    //         (SELECT SUM(ft.Amount) 
    //          FROM `financial_transaction_table` ft 
    //          WHERE ft.OrderNumber > 0 
    //            AND ft.OrderNumber < 100000
    //            AND ft.ValidStatus = 'Valid' AND TransactionType IN ('Income', 'Investment')
    //            AND DATE(ft.TransactionDate) BETWEEN :PDOStartDate AND :PDOEndDate
    //         ) as finance_amount
    // ");
    $stmt = $pdo->prepare("
        SELECT 
    (SELECT COALESCE(SUM(o.Receivable), 0) 
        + COALESCE(SUM(CAST(o.AdjustedOrderAmount AS DECIMAL(10, 2))), 0) 
     FROM `order_table` o 
     WHERE o.OrderNumber > 0 
       AND o.OrderNumber < 100000
       AND o.CancelFlag = 0 
       AND o.OrderDate BETWEEN :PDOStartDate AND :PDOEndDate
    ) AS order_amount, 
    (SELECT SUM(ft.Amount) 
     FROM `financial_transaction_table` ft 
     WHERE ft.OrderNumber IN (
         SELECT o1.OrderNumber 
         FROM `order_table` o1 
         WHERE o1.OrderNumber > 0 
           AND o1.OrderNumber < 100000
           AND o1.CancelFlag = 0 
           AND o1.OrderDate BETWEEN :PDOStartDate AND :PDOEndDate
     ) 
     AND ft.ValidStatus = 'Valid' 
     AND ft.TransactionType IN ('Income', 'Investment')
    ) AS finance_amount;

    ");
    $stmt->bindParam(':PDOStartDate', $startDate);
    $stmt->bindParam(':PDOEndDate', $endDate);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);

    // Return the result as a JSON object
    $response = [
        'order_amount' => $result['order_amount'],
        'finance_amount' => $result['finance_amount']
    ];
    echo json_encode($response);
} catch (PDOException $e) {
    echo json_encode("Error fetching amounts: " . $e->getMessage());
}
?>
