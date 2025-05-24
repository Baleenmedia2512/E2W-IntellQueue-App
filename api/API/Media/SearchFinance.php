<?php
require 'ConnectionManager.php';
$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Test';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header('Content-Type: application/json; charset=utf-8');

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();
    // Assume you have the RateId from somewhere, replace 'your_rate_id_here' with the actual value
    $searhTerm = $_GET['JsonSearchTerm'];

    $searchTermArray = (explode(" ",$searhTerm));
    $searchLength = count($searchTermArray);
    $NoOfQuery = '';
    $i = 0;

    while ($i < $searchLength){
        if ($i > 0) {
            $NoOfQuery .= ' And ';
        }
        $NoOfQuery .= '`SearchTerm` LIKE ?';
        $i += 1;
    }

    // Prepare the query
  $stmt = $pdo->prepare("SELECT `SearchTerm` FROM `financial_transaction_table` WHERE " . $NoOfQuery . " AND ValidStatus = 'Valid' ORDER BY `ID` DESC");



    // Generate the parameters for execution
    $params = array_map(function($item) {
        return '%' . $item . '%';
    }, $searchTermArray);

    // Execute the query with parameters
    $stmt->execute($params);

    // Fetch the results
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $searchTerms = array_map(function($row) {
    return $row['SearchTerm'];
    }, $results);
    // Output the results as JSON (you can modify this part based on your needs)
    echo json_encode($searchTerms);
    
} catch (PDOException $e) {
    echo "Error calling stored procedure: " . $e->getMessage();
}
?>