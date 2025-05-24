<?php
// Establish connection to the database
require 'ConnectionManager.php';
$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Test';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");
header('Content-Type: application/json');

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();
} catch (PDOException $e) {
    echo json_encode(['error' => "Connection failed: " . $e->getMessage()]);
    exit;
}

// Get the consultant name, number, and place from the request
$consultantName = isset($_GET['ConsultantName']) ? trim($_GET['ConsultantName']) : '';
$consultantNumber = isset($_GET['ConsultantNumber']) ? trim($_GET['ConsultantNumber']) : '';
$consultantPlace = isset($_GET['ConsultantPlace']) ? trim($_GET['ConsultantPlace']) : '';

if ($consultantName !== '') {
    $inputPhonetic = metaphone($consultantName); // Generate phonetic representation

    // Step 1: Get initial matches using SQL (LIKE for partial matches)
    $sql = "SELECT CId, ConsultantName, ConsultantNumber, ConsultantPlace FROM consultant_table 
            WHERE ConsultantName LIKE CONCAT('%', :consultantName, '%') 
            AND Validity = 1 
            LIMIT 20";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['consultantName' => $consultantName]);
    $matchedConsultants = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Step 2: Get all names from DB for further fuzzy matching
    $sqlAll = "SELECT CId, ConsultantName, ConsultantNumber, ConsultantPlace FROM consultant_table WHERE Validity = 1";
    $stmtAll = $pdo->query($sqlAll);
    $allConsultants = $stmtAll->fetchAll(PDO::FETCH_ASSOC);

    $similarConsultants = [];

    foreach ($allConsultants as $consultant) {
        $cId = $consultant['CId'];
        $name = $consultant['ConsultantName'];
        $number = $consultant['ConsultantNumber'];
        $place = $consultant['ConsultantPlace'];
        $levDist = levenshtein($consultantName, $name);
        similar_text($consultantName, $name, $percentSimilar);

        if (
            metaphone($name) === $inputPhonetic ||
            $levDist <= 3 ||
            $percentSimilar >= 75 ||
            in_array(['CId' => $cId, 'ConsultantName' => $name, 'ConsultantNumber' => $number, 'ConsultantPlace' => $place], $matchedConsultants)
        ) {
            $similarConsultants[] = [
                'CId' => $cId,
                'ConsultantName' => $name,
                'ConsultantNumber' => $number,
                'ConsultantPlace' => $place
            ];
        }
    }

    // Remove duplicates and limit results
    $similarConsultants = array_values(array_unique($similarConsultants, SORT_REGULAR));

    // Exclude exact input consultant, even if place is empty
    $similarConsultants = array_filter($similarConsultants, function ($consultant) use ($consultantName, $consultantNumber, $consultantPlace) {
        return !(strtolower($consultant['ConsultantName']) === strtolower($consultantName) &&
                 ($consultant['ConsultantNumber'] === $consultantNumber || (empty($consultant['ConsultantNumber']) && empty($consultantNumber))) &&
                 ($consultant['ConsultantPlace'] === $consultantPlace || (empty($consultant['ConsultantPlace']) && empty($consultantPlace))));
    });

    // Ensure unique consultants
    $uniqueConsultants = [];
    foreach ($similarConsultants as $consultant) {
        $key = $consultant['CId']; // Use CId as a unique key
        $uniqueConsultants[$key] = $consultant;  // Avoids duplicate consultant names
    }
    $similarConsultants = array_values($uniqueConsultants);

    // Limit to 5 results
    $similarConsultants = array_slice($similarConsultants, 0, 5);

    echo json_encode(['similarConsultants' => $similarConsultants]);
} else {
    echo json_encode(['similarConsultants' => []]);
}

// Close the database connection
$pdo = null;
?>
