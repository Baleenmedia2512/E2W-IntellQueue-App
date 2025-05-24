<?php
require 'ConnectionManager.php';
$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Media';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();

    // Prepare the query
    $stmt = $pdo->prepare("SELECT o.OrderDate, c.consultantNumber, o.consultantName, o.Card, COUNT(o.Card) AS card_count 
                           FROM consultant_table c 
                           JOIN order_table o ON c.consultantName = o.consultantName 
                           WHERE o.OrderDate = CURRENT_DATE 
                             AND o.OrderNumber > 0 
                             AND o.OrderNumber < 100000 
                             AND o.CancelFlag = 0 
                             AND c.consultantNumber != 0 
                             AND c.consultantNumber != '' 
                           GROUP BY c.consultantNumber, o.Card;");
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
