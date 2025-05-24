<?php
require 'ConnectionManager.php';
$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Media';
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();
    
    // Fetch data from query parameters
    $entryUser = isset($_GET['JsonEntryUser']) ? $_GET['JsonEntryUser'] : '';
    $pageName = isset($_GET['JsonPageName']) ? $_GET['JsonPageName'] : '';
    $moduleName = isset($_GET['JsonModuleName']) ? $_GET['JsonModuleName'] : '';
    $clickCount = isset($_GET['JsonClickCount']) ? $_GET['JsonClickCount'] : 0;
    $timeTaken = isset($_GET['JsonTimeTaken']) ? $_GET['JsonTimeTaken'] : 0;
    $quoteID = isset($_GET['JsonQuoteID']) ? $_GET['JsonQuoteID'] : null;
    $cartItems = isset($_GET['JsonCartItems']) ? $_GET['JsonCartItems'] : 0;

        // Validate required fields
    if (empty($entryUser) || empty($pageName) || empty($moduleName)) {
        echo json_encode("Error: Required fields (EntryUser, PageName, ModuleName) cannot be empty.");
        exit;
    }

    // Insert query for module_tracking_table
    $stmt = $pdo->prepare(
        "INSERT INTO module_tracking_table 
        (EntryUser, PageName, moduleName, ClickCount, TimeTaken, QuoteID, CartItems) 
        VALUES 
        (:EntryUser, :PageName, :ModuleName, :ClickCount, :TimeTaken, :QuoteID, :CartItems)"
    );

    // Bind parameters
    $stmt->bindParam(':EntryUser', $entryUser);
    $stmt->bindParam(':PageName', $pageName);
    $stmt->bindParam(':ModuleName', $moduleName);
    $stmt->bindParam(':ClickCount', $clickCount);
    $stmt->bindParam(':TimeTaken', $timeTaken);
    $stmt->bindParam(':QuoteID', $quoteID);
    $stmt->bindParam(':CartItems', $cartItems);

    // Execute the query
    $stmt->execute();
    
    echo json_encode("Module Tracking Data Inserted Successfully!");
} catch (PDOException $e) {
    echo json_encode("Error Inserting Data: " . $e->getMessage());
}
?>
