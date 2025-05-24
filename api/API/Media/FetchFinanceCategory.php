<?php
require 'ConnectionManager.php';
$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Media';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    // Connect to the database with the provided DB name
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();

    // Get the finance ID from the request
    $financeId = $_GET['JsonFinanceId']; // Assuming you're using the same parameter for finance ID

    // Prepare a SQL statement to fetch data from financial_transaction_table
    $stmt = $pdo -> prepare("SELECT * FROM financial_transaction_table WHERE id = :id");
    $stmt->bindParam(':id', $financeId, PDO::PARAM_INT);
    $stmt->execute();

    // Fetch the results
    $results = $stmt->fetch(PDO::FETCH_ASSOC);

    // Output the results as JSON
    if ($results && $results['ValidStatus'] === 'Invalid') {
        echo json_encode("Finance ID is rejected");
    } else if ($results && $results['ValidStatus'] === 'Valid') {
        echo json_encode($results);
    } else {
        echo json_encode("No finance details found for the provided ID");
    }

} catch (PDOException $e) {
    echo "Error fetching Finance ID: " . $e->getMessage();
}
?>
