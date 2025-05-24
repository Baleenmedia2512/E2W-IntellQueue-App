<?php
require 'ConnectionManager.php';
$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Media';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();
    $AdMedium = $_GET['JsonAdMedium'];
    $AdType = $_GET['JsonAdType'];

    $stmtRecommended = $pdo->prepare("SELECT DISTINCT `vendorName` FROM `rate_table` WHERE adType = :adTypePDO and `vendorName` <> TRIM('')");
    $stmtRecommended -> bindParam(":adTypePDO", $AdType);
    $stmtRecommended -> execute();
    $recommended = $stmtRecommended->fetchAll(PDO::FETCH_COLUMN);

    $stmtSimilar = $pdo->prepare("SELECT DISTINCT `vendorName` FROM `rate_table` WHERE rateName = :adMediumPDO AND `vendorName` NOT IN (SELECT `vendorName` FROM `rate_table` WHERE adType = :adTypePDO) and `vendorName` <> TRIM('')");
    $stmtSimilar -> bindParam(":adMediumPDO", $AdMedium);
    $stmtSimilar -> bindParam(":adTypePDO", $AdType);
    $stmtSimilar->execute();
    $similar = $stmtSimilar->fetchAll(PDO::FETCH_COLUMN);

// Call the stored procedure with a parameter
    $stmt = $pdo->prepare("SELECT DISTINCT `vendorName` FROM vendor_table WHERE `ApprovedStatus` = 'Approved' AND `vendorName` NOT IN (SELECT `vendorName` FROM `rate_table` WHERE rateName = :adMediumPDO AND `vendorName` NOT IN (SELECT `vendorName` FROM `rate_table` WHERE adType = :adTypePDO)) and `vendorName` <> TRIM('') GROUP BY vendorName ORDER BY vendorName");
    $stmt -> bindParam(":adMediumPDO", $AdMedium);
    $stmt -> bindParam(":adTypePDO", $AdType);
    $stmt->execute();
    // Fetch the results
    $results = $stmt->fetchAll(PDO::FETCH_COLUMN);

$resultArray = [];

if (!empty($recommended)) {
        $resultArray[] = [
            'label' => 'Recommended',
            'options' => array_map(function($unit) {
                return ['value' => $unit, 'label' => $unit];
            }, $recommended),
        ];
    }

    // Add 'Similar' only if it has values
    if (!empty($similar)) {
        $resultArray[] = [
            'label' => 'Similar',
            'options' => array_map(function($unit) {
                return ['value' => $unit, 'label' => $unit];
            }, $similar),
        ];
    }

    // Add 'Other' always
    $resultArray[] = [
        'label' => 'Other',
        'options' => array_map(function($unit) {
            return ['value' => $unit, 'label' => $unit];
        }, $results),
    ];
    // Convert the associative array to JSON and echo the result
    echo json_encode($resultArray);
} catch (PDOException $e) {
    echo "Error calling stored procedure: " . $e->getMessage();
}
?>
