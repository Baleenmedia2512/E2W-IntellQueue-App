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
        $queryParts[] = '(o.OrderNumber LIKE ? OR o.Source LIKE ? OR o.ClientName LIKE ? OR o.ClientContact LIKE ? OR o.ClientAuthorizedPerson LIKE ?)';
        array_push($params, ...array_fill(0, 5, '%' . $term . '%'));
    }

    $whereClause = $queryParts ? 'AND (' . implode(' AND ', $queryParts) . ')' : '';

    $order_table_query = "
        SELECT o.* 
        FROM order_table o
        INNER JOIN (
            SELECT 
                ClientContact, 
                MAX(OrderNumber) AS LatestOrder
            FROM order_table 
            WHERE 
                DateOfLastRelease < DATE_SUB(CURRENT_DATE, INTERVAL 1 WEEK) 
                AND CancelFlag = 0 
            GROUP BY ClientContact
        ) AS sub 
        ON o.ClientContact = sub.ClientContact AND o.OrderNumber = sub.LatestOrder 
        WHERE 
            o.DateOfLastRelease < DATE_SUB(CURRENT_DATE, INTERVAL 1 WEEK) 
            AND o.CancelFlag = 0 AND NOT EXISTS (
              SELECT 1 FROM leads_tracking_table lt
              WHERE lt.ClientContact = o.ClientContact
                AND lt.LeadType = 'Existing'
                AND (lt.LeadDate >= DATE_SUB(CURRENT_DATE, INTERVAL 1 MONTH)
                OR (lt.Status = 'Unqualified' AND lt.RejectionReason <> 'Not required at the moment'))
          ) 
            $whereClause 
    "; //AND o.DateOfLastRelease > DATE_SUB(CURRENT_DATE, INTERVAL 1 YEAR)  Line 41

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