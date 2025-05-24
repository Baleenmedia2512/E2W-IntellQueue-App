<?php
require 'ConnectionManager.php';
$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Media';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();
    $AdMedium = isset($_GET['JsonAdMedium']) ? $_GET['JsonAdMedium'] : '';
    $AdType = isset($_GET['JsonAdType']) ? $_GET['JsonAdType'] : '';

    $stmtRecommended = $pdo->prepare("SELECT DISTINCT `UnitName` FROM `units_table` WHERE `UnitName` IN (SELECT `Units` FROM rate_table WHERE adType = :adTypePDO) AND `IsValid` <> 0");
    $stmtRecommended -> bindParam(":adTypePDO", $AdType);
    $stmtRecommended -> execute();
    $recommended = $stmtRecommended->fetchAll(PDO::FETCH_COLUMN);

    $stmtSimilar = $pdo->prepare("SELECT DISTINCT `UnitName` FROM `units_table` WHERE `UnitName` IN (SELECT `Units` FROM `rate_table` WHERE rateName = :adMediumPDO and `Units` NOT IN (SELECT `Units` FROM `rate_table` WHERE adType = :adTypePDO )) AND `IsValid` <> 0 ORDER BY `UnitName`");
    $stmtSimilar -> bindParam(":adMediumPDO", $AdMedium);
    $stmtSimilar -> bindParam(":adTypePDO", $AdType);
    $stmtSimilar->execute();
    $similar = $stmtSimilar->fetchAll(PDO::FETCH_COLUMN);

    $stmtOther = $pdo->prepare("SELECT DISTINCT `UnitName` FROM `units_table` WHERE UnitName NOT IN (SELECT `Units` FROM `rate_table` WHERE rateName = :adMediumPDO) AND `IsValid` <> 0 ORDER BY `UnitName`");
    $stmtOther -> bindParam(":adMediumPDO", $AdMedium);
    $stmtOther->execute();
    $otherData = $stmtOther->fetchAll(PDO::FETCH_COLUMN);

    // Organize data into associative array
//    $resultArray = [
//         [
//             'label' => 'Recommended',
//             'options' => array_map(function($unit) {
//                 return ['value' => $unit, 'label' => $unit];
//             }, $recommended),
//         ],
//         [
//             'label' => 'Similar',
//             'options' => array_map(function($unit) {
//                 return ['value' => $unit, 'label' => $unit];
//             }, $similar),
//         ],
//         [
//             'label' => 'Other',
//             'options' => array_map(function($unit) {
//                 return ['value' => $unit, 'label' => $unit];
//             }, $otherData),
//         ],
//     ];

// Add 'Recommended' only if it has values
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
        }, $otherData),
    ];
    // Convert the associative array to JSON and echo the result
    echo json_encode($resultArray);

} catch (PDOException $e) {
    echo "Error calling stored procedure: " . $e->getMessage();
}
?>