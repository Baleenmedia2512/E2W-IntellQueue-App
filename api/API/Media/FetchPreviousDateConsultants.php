<?php
require 'ConnectionManager.php';
$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Test';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();

    // Prepare the query
    $stmt = $pdo->prepare("SELECT 
    o.OrderDate, 
    c.ConsultantNumber, 
    o.ConsultantName, 
    o.Card, 
    COUNT(DISTINCT o.OrderNumber) AS card_count 
FROM 
    consultant_table c 
JOIN 
    order_table o ON c.ConsultantName = o.ConsultantName 
JOIN 
    financial_transaction_table ftt ON o.OrderNumber = ftt.OrderNumber 
WHERE 
    o.OrderDate = DATE_SUB(CURRENT_DATE, INTERVAL 1 DAY) 
    AND o.OrderNumber > 0 
    AND o.OrderNumber < 100000 
    AND o.CancelFlag = 0 
    AND c.ConsultantNumber != 0 
    AND c.ConsultantNumber != '' 
    AND c.IsSMSRequired = 1 
    AND c.Validity = 1 
    AND ftt.ValidStatus = 'Valid' 
GROUP BY 
    c.ConsultantNumber, o.Card;
");
    $stmt->execute();

    // Fetch all results
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Prepare the response
    $response = [
        'status' => 'success',
        'data' => $result
    ];

    // Return the result as a JSON object
    echo json_encode($response);
    
} catch (PDOException $e) {
    // Return error message
    echo json_encode([
        'status' => 'error',
        'message' => "Error fetching data: " . $e->getMessage()
    ]);
}
?>
