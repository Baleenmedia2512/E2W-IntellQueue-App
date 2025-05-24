<?php
require 'ConnectionManager.php';
$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Test';
// if($dbName !== 'Grace Scans' && $dbName !== 'Baleen Media'){
//     $dbName = 'Baleen Media';
// }
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();
    $EntryUser = $_GET['JsonEntryUser'];
    $RateId = isset($_GET['JsonRateId']) ? $_GET['JsonRateId'] : '';
    $Qty = $_GET['JsonQty'];
    $UnitPrice = $_GET['JsonUnitPrice'];
    $Unit = $_GET['JsonUnit'];
    $Width = isset($_GET['JsonWidth']) ? $_GET['JsonWidth'] : 1;
    $SlabId = isset($_GET['JsonSlabId']) ? $_GET['JsonSlabId'] : '';

    $checkstmt = $pdo->prepare("SELECT * FROM rates_qty_slab_table WHERE Id = :SlabIdPDO");
    $checkstmt->bindParam(":SlabIdPDO", $SlabId);
    $checkstmt->execute();
    $result = $checkstmt->fetchAll();

    // Prepare the SELECT statement
    // $qtystmt = $pdo->prepare("SELECT `MinimumUnit` FROM rate_table WHERE RateId = :RateIdPDO");
    // $qtystmt->bindParam(":RateIdPDO", $RateId);
    // $qtystmt->execute();

    // // Fetch the result
    // $minQtyArray = $qtystmt->fetch(PDO::FETCH_ASSOC);

    // // Check if a result was returned
    // if ($minQtyArray) {
    //     $minQty = $minQtyArray["MinimumUnit"];

    //     // If the provided quantity is less than or equal to the minimum quantity, update it
    //     if ($Qty <= $minQty) {
    //         $stmt = $pdo->prepare("UPDATE rate_table SET `MinimumUnit` = :StartQtyPDO WHERE RateId = :RateIdPDO");
    //         $stmt->bindParam(":StartQtyPDO", $Qty);
    //         $stmt->bindParam(":RateIdPDO", $RateId);
    //         $stmt->execute();
    //     }
    // }

    if(empty($result)) {
        $stmt = $pdo->prepare("INSERT INTO rates_qty_slab_table VALUES(0, CURRENT_TIMESTAMP, :EntryUserPDO, :RateIdPDO, :StartQtyPDO, :WidthPDO,:UnitPricePDO, :UnitPDO, 1)");
        $stmt->bindParam(":EntryUserPDO", $EntryUser);
        $stmt->bindParam(":RateIdPDO", $RateId);
        $stmt->bindParam(":StartQtyPDO", $Qty);
        $stmt->bindParam(":WidthPDO", $Width);
        $stmt->bindParam(":UnitPricePDO", $UnitPrice);
        $stmt->bindParam(":UnitPDO", $Unit);
        $stmt->execute();
        if($stmt->rowCount() > 0){
            echo json_encode("Inserted Successfully!");
        }else{
            echo json_encode("Failed to Insert");
        }
    } else{
        $stmt = $pdo->prepare("UPDATE rates_qty_slab_table SET EntryDateTime = CURRENT_TIMESTAMP, EntryUser = :EntryUserPDO, UnitPrice = :UnitPricePDO, Unit = :UnitPDO, `Validity` = 1, Width = :PDOWidth WHERE Id = :SlabIdPDO");
        $stmt->bindParam(":EntryUserPDO", $EntryUser);
        // $stmt->bindParam(":RateIdPDO", $RateId);
        // $stmt->bindParam(":StartQtyPDO", $Qty);
        $stmt->bindParam(":UnitPricePDO", $UnitPrice);
        $stmt->bindParam(":PDOWidth", $Width);
        $stmt->bindParam(":UnitPDO", $Unit);
        $stmt->bindParam(":SlabIdPDO", $SlabId);
        $stmt->execute();
        if($stmt->rowCount() > 0){
            echo json_encode("Updated Successfully!");
        } else{
            echo json_encode("Failed to Update");
        }
    }

   
}catch(PDOException $e){
    echo json_encode("Error inserting data: ".$e->getMessage());
}