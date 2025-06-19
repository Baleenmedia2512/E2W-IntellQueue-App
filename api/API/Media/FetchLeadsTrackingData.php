<?php
require 'ConnectionManager.php';
$dbName = isset($_GET['JsonDBName']) ? htmlspecialchars($_GET['JsonDBName']) : 'Baleen Test';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();

    $StartDate = isset($_GET['JsonStartDate']) ? $_GET['JsonStartDate'] : 'CURRENT_DATE';
    $EndDate = isset($_GET['JsonEndDate']) ? $_GET['JsonEndDate'] : 'CURRENT_DATE + INTERVAL 1 DAY';

    // Append time to cover full day
    $startDateTime = $StartDate . ' 00:00:00';
    $endDateTime = $EndDate . ' 23:59:59';

    $query = "
        SELECT * FROM leads_tracking_table 
        WHERE LeadType = 'Existing' 
        AND ArrivedDateTime BETWEEN :StartDateTime AND :EndDateTime
        GROUP BY ClientContact
    ";

    $params = [
        ':StartDateTime' => $startDateTime,
        ':EndDateTime' => $endDateTime
    ];

    $stmt = $pdo->prepare($query);
    $stmt->execute($params); // No parameters needed for this query
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(array_unique($results, SORT_REGULAR));
} catch (PDOException $e) {
    echo "Database error: " . $e->getMessage();
}
?>