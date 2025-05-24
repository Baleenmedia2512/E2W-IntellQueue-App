<?php
require 'ConnectionManager.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header('Content-Type: application/json');

// Set default database name and validate it
$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Test';

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();

    // Validate and sanitize input parameters
    $UnitId = isset($_GET['JsonUnitId']) ? $_GET['JsonUnitId'] : '';
    $RateId = isset($_GET['JsonRateId']) ? $_GET['JsonRateId'] : null;
    $Qty = isset($_GET['JsonQty']) ? (int)$_GET['JsonQty'] : null;
    $UnitPrice = isset($_GET['JsonUnitPrice']) ? $_GET['JsonUnitPrice'] : null;
    $Unit = isset($_GET['JsonUnit']) ? $_GET['JsonUnit'] : null;

    // Check for required parameters
    if ($Qty == null || $UnitPrice == null || $Unit == null || $RateId == null) {
        echo json_encode(["error" => "Missing required parameters."]);
        exit;
    }

  
    $stmt = $pdo->prepare("UPDATE rates_qty_slab_table SET StartQty = :StartQtyPDO, UnitPrice = :UnitPricePDO, Unit = :UnitPDO, Validity = 1 WHERE RateId = :RateIdPDO and StartQty = :StartQtyPDO");
    $stmt->bindParam(":RateIdPDO", $RateId, PDO::PARAM_STR);
    // Bind common parameters
    $stmt->bindParam(":StartQtyPDO", $Qty, PDO::PARAM_INT);
    $stmt->bindParam(":UnitPricePDO", $UnitPrice, PDO::PARAM_STR);
    $stmt->bindParam(":UnitPDO", $Unit, PDO::PARAM_STR);
 
    

    // Execute statement
    if ($stmt->execute()) {
        echo json_encode(["message" => "Updated Successfully!"]);
    } else {
        $errorInfo = $stmt->errorInfo();
        echo json_encode(["error" => "Failed to update record: " . implode(" ", $errorInfo)]);
    }
    
} catch (PDOException $e) {
    echo json_encode(["error" => "Database error: " . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(["error" => "General error: " . $e->getMessage()]);
}
?>