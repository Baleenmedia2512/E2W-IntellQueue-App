<?php
require 'ConnectionManager.php';
$dbName = isset($_GET['JsonDBName']) ? htmlspecialchars($_GET['JsonDBName']) : 'Baleen Test';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();

    $searchTerm = $_GET['JsonSearchTerm'] ?? ''; // Get the Search Term from front end
    $searchTerm = htmlspecialchars($searchTerm); // Sanitize input
    $searchTermArray = array_filter(explode(" ", $searchTerm)); // Split and filter empty terms
    $queryParts = [];
    $params = [];

    // Loop all the available inputs
    foreach ($searchTermArray as $term) {
        $queryParts[] = '(OrderNumber LIKE ? OR Source LIKE ? OR ClientAuthorizedPerson LIKE ? OR ClientName LIKE ? OR ClientContact LIKE ?)';
        $params = array_merge($params, array_fill(0, 7, '%' . $term . '%'));
    }

    $NoOfQuery = $queryParts ? implode(' AND ', $queryParts) : '';

    $sql = "SELECT DISTINCT `OrderNumber`, `Source`, `CSE`, `Receivable`, `Card`, `AdCategory`, `AdType`, `AdWidth`, `AdHeight`, `Position`, `ClientName`, `ClientCategory`, `ClientGST`, `ClientPAN`, `DoorStreet`, `Area`, `City`, `State`, `PIN`, `ClientContact`, `ClientAuthorizedPerson`, `ContactPerson`, `DateOfFirstRelease`, `DateOfLastRelease`, `Address`, `Location`, `Package`, `RateWiseOrderNumber` FROM order_table WHERE `DateOfLastRelease` < CURRENT_DATE AND `DateOfLastRelease` > DATE_SUB(CURRENT_DATE, INTERVAL 1 YEAR) AND CancelFlag = 0";
    
    // Add dynamic conditions only if search terms exist
    if ($NoOfQuery) {
        $sql .= " AND ($NoOfQuery)";
    }

    $sql .= " ORDER BY `OrderNumber` DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Output the results as JSON
    echo json_encode($results);
} catch (PDOException $e) {
    echo "Database error: " . $e->getMessage();
}
?>
