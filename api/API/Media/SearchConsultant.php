<?php
require 'ConnectionManager.php';
$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Test';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header('Content-Type: application/json; charset=utf-8');

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();
    $searchTerm = $_GET['JsonSearchTerm'];
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

    // Prepare base SQL statement
    $sql = "SELECT `SearchTerm`, `Validity` FROM `consultant_table` WHERE " . $NoOfQuery;

    // Only include the validity condition if invalidOnly is false
    if (!$invalidOnly) {
        $sql .= " AND `Validity` = 1"; // Only valid consultants
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

    // Prepare search terms without showing validity
    $searchTerms = array_map(function($row) {
        return [
            'SearchTerm' => $row['SearchTerm'],
            'Validity' => $row['Validity'] // Keep validity for front-end use
        ];
    }, $results);

    // Output the results as JSON
    echo json_encode($searchTerms);
    
} catch (PDOException $e) {
    echo "Error calling stored procedure: " . $e->getMessage();
}
?>
