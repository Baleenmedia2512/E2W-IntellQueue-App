<?php
require 'ConnectionManager.php';
$dbName = isset($_GET['JsonDBName']) ? htmlspecialchars($_GET['JsonDBName']) : 'Baleen Test';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();

    $searchTerm = $_GET['JsonSearchTerm'] ?? '';
    $searchTerm = htmlspecialchars($searchTerm);
    $searchTermArray = array_filter(explode(" ", $searchTerm));
    $queryParts = [];
    $params = [];

    foreach ($searchTermArray as $term) {
        $queryParts[] = '(ClientName LIKE ? OR Platform LIKE ? OR ClientContact LIKE ? OR Status LIKE ? OR ClientEmail LIKE ? OR Remarks LIKE ?)';
        array_push($params, ...array_fill(0, 6, '%' . $term . '%'));
    }

    $whereClause = $queryParts ? 'AND (' . implode(' AND ', $queryParts) . ')' : '';

    $order_table_query = "
        SELECT * FROM leads_tracking_table WHERE LeadType = 'Existing' AND NextFollowupDate >= DATE_SUB(CURRENT_DATE, INTERVAL 3 MONTH) AND (Status LIKE 'Call Followup' OR Status LIKE 'Unreachable') $whereClause GROUP BY ClientContact
    ";

    // $leads_table_query = "SELECT * FROM leads_tracking_table WHERE LeadType = 'Existing' AND (Status LIKE 'Call Followup' OR Status LIKE 'Unreachable') ORDER BY NextFollowupDate DESC";

    // $sql = "($order_table_query) UNION ALL ($leads_table_query)";

    $stmt = $pdo->prepare($order_table_query);
    $stmt->execute($params);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(array_unique($results, SORT_REGULAR));
} catch (PDOException $e) {
    echo "Database error: " . $e->getMessage();
}
?>