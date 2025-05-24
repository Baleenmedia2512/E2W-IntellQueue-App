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

try{
    $stmt = $pdo->prepare("CALL FetchCurrentBalanceAmount()");
    $stmt->execute();
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($results);
} catch (PDOException $e) {
        echo json_encode("Error Inserting Data: " . $e->getMessage());
}
?>
