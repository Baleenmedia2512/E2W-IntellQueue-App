<?php
require 'ConnectionManager.php';
$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Media';
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();

    sleep(2);
    $EntryDateTime = date('Y-m-d H:i:s');
    $EntryUser = isset($_GET['JsonEntryUser']) ? $_GET['JsonEntryUser'] : '';
    $OrderNumber = isset($_GET['JsonOrderNumber']) ? $_GET['JsonOrderNumber'] : '';
    // $ClientName = isset($_GET['JsonClientName']) ? $_GET['JsonClientName'] : '';
    // $ClientNumber = isset($_GET['JsonClientNumber']) ? $_GET['JsonClientNumber'] : '';
    $Stage = isset($_GET['JsonStage']) ? $_GET['JsonStage'] : '';
    $StageAmount = isset($_GET['JsonStageAmount']) ? $_GET['JsonStageAmount'] : 0;
    // $OrderAmount = isset($_GET['JsonOrderAmount']) ? $_GET['JsonOrderAmount'] : 0; 
    $Description = isset($_GET['JsonDescription']) ? $_GET['JsonDescription'] : ''; 
    $DueDate = isset($_GET['JsonDueDate']) ? $_GET['JsonDueDate'] : '';

    // $SearchTerm = $MID." - ".$OrderNumber 
    //             . ($ClientName !== "" ? " - " . $ClientName : "")
    //             . " - " . $ClientNumber 
    //             . (" - ₹" .$OrderAmount);

    // Prepare the SQL statement
    $stmtPaymentMilestone = $pdo->prepare("
        INSERT INTO payment_milestone_table 
        (EntryDateTime, EntryUser, OrderNumber, Stage, StageAmount, Description, DueDate, IsPaymentDone)
        VALUES 
        (:PDOEntryDateTime, :PDOEntryUser, :PDOOrderNumber, :PDOStage, :PDOStageAmount, :PDODescription, :PDODueDate, 0)
    ");

    $stmtPaymentMilestone->bindParam(':PDOEntryDateTime', $EntryDateTime);
    $stmtPaymentMilestone->bindParam(':PDOEntryUser', $EntryUser); 
    $stmtPaymentMilestone->bindParam(':PDOOrderNumber', $OrderNumber);
    // $stmtPaymentMilestone->bindParam(':PDOClientName', $ClientName);
    // $stmtPaymentMilestone->bindParam(':PDOClientNumber', $ClientNumber);
    $stmtPaymentMilestone->bindParam(':PDOStage', $Stage);
    $stmtPaymentMilestone->bindParam(':PDOStageAmount', $StageAmount);
    // $stmtPaymentMilestone->bindParam(':PDOOrderAmount', $OrderAmount);
    $stmtPaymentMilestone->bindParam(':PDODescription', $Description);
    $stmtPaymentMilestone->bindParam(':PDODueDate', $DueDate);
    // $stmtPaymentMilestone->bindParam(':PDOSearchTerm', $SearchTerm);

    // Execute the query
    $stmtPaymentMilestone->execute();
    
    echo json_encode("Stage Created Successfully!");
} catch (PDOException $e) {
    echo json_encode("Error Inserting Data: " . $e->getMessage());
}
?>
