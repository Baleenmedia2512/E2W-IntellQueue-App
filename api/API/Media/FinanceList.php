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
// Retrieve start and end date from the request
$startDate = isset($_GET['JsonStartDate']) ? $_GET['JsonStartDate'] : '';
$endDate = isset($_GET['JsonEndDate']) ? $_GET['JsonEndDate'] : '';

try{
    //  MP-77-Create procedures and PHP file for fetching orders and finance list.
    $stmt = $pdo->prepare("CALL FetchFinanceList(?, ?)");
    $stmt->execute([$startDate, $endDate]);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $stmt->closeCursor();
    echo json_encode($results);
} catch (PDOException $e) {
        echo json_encode("Error Inserting Data: " . $e->getMessage());
}
?>
