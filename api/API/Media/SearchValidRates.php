<?php
require 'ConnectionManager.php';
$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Test';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header('Content-Type: application/json; charset=utf-8');

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();
    $searchTerm = isset($_GET['JsonSearchTerm']) ? $_GET['JsonSearchTerm'] : '';
    $invalidOnly = isset($_GET['InvalidOnly']) && $_GET['InvalidOnly'] === 'true'; // Check if invalidOnly is set

    $searchTermArray = explode(" ", $searchTerm);
    $searchLength = count($searchTermArray);
    $NoOfQuery = '';
    $i = 0;

    // Build the query based on search terms
    while ($i < $searchLength) {
        if ($i > 0) {
            $NoOfQuery .= ' AND ';
        }
        $NoOfQuery .= '`SearchTerm` LIKE ?';
        $i += 1;
    }

    // Prepare base SQL statement to get both "Approved" and "Rejected" statuses
    $sql = "SELECT `RateID`, `SearchTerm`, `ApprovedStatus` FROM `rate_table` WHERE " . $NoOfQuery;

    // Conditionally filter based on ApprovedStatus
    if (!$invalidOnly) {
        $sql .= " AND `ApprovedStatus` = 'Approved' AND `ValidityDate` >= CURRENT_DATE"; // Only include "Approved" rates if InvalidOnly is false
    }

    $stmt = $pdo->prepare($sql);

    // Generate the parameters for execution
    $params = array_map(function($item) {
        return '%' . $item . '%';
    }, $searchTermArray);

    // Execute the query with parameters
    $stmt->execute($params);

    // Fetch the results
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Prepare the result including both "Approved" and "Rejected" statuses
    $searchTerms = array_map(function($row) {
        return [
            'RateID' => $row['RateID'],
            'SearchTerm' => $row['SearchTerm'],
            'ApprovedStatus' => $row['ApprovedStatus'], // Either "Approved" or "Rejected"
        ];
    }, $results);

    // Output the results as JSON
    echo json_encode($searchTerms);

} catch (PDOException $e) {
    echo json_encode(['error' => "Error calling stored procedure: " . $e->getMessage()]);
}
?>
