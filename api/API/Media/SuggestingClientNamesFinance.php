<?php
require 'ConnectionManager.php';
$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Media';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();
    // Get the search term from the React app
    $search_term = $_GET['suggestion'];

    if($dbName === 'Grace Scans'){
        // Prepare the SQL statement to fetch client names based on the search term
        $sql = "SELECT DISTINCT ClientName, ClientContact FROM order_table WHERE ClientName LIKE :suggestion LIMIT 10";
    } else{
        $sql = "SELECT DISTINCT ClientName, ClientContact FROM order_table WHERE ClientName LIKE :suggestion LIMIT 10";
    }
    $stmt = $pdo->prepare($sql);
    $stmt->bindValue(':suggestion', '%' . $search_term . '%');
    $stmt->execute();

    // Fetch the client names and store them in an array
    $clients = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $client_details = array();
    // Output the client names and contacts
    foreach ($clients as $client) {
        $clientdetails = $client['ClientName']. '(' . $client['ClientContact'] . ')';
        array_push($client_details, $clientdetails);
    }

    echo json_encode($client_details);

    // Close the database connection
    $pdo = null;
} catch(PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}


?>
