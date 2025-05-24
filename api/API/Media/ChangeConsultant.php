<?php
require 'ConnectionManager.php';
$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Media';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();
} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
    exit();
}

function fetchConsultantId($ConsultantName) {
    global $pdo;
    $stmt = $pdo->prepare("SELECT CId FROM consultant_table WHERE ConsultantName = :PDOConsultantName");
    $stmt->bindParam(':PDOConsultantName', $ConsultantName);
    // $stmt->bindParam(':PDOConsultantNumber', $ConsultantContact);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    return $result !== false ? $result['CId'] : 0;
}

function insertConsultant($EntryUser, $ConsultantName) {
    global $pdo;
    $stmtId = $pdo->prepare("SELECT MAX(CId) as CId FROM consultant_table");
    $stmtId->execute();
    $result = $stmtId->fetch(PDO::FETCH_ASSOC);
    $CId = ($result !== false) ? $result['CId'] + 1 : 0;
    $stmtInsert = $pdo->prepare("INSERT INTO consultant_table (CId, EntryDateTime, EntryUser, ConsultantName, ConsultantNumber, Validity) VALUES (:CId, CURRENT_TIMESTAMP, :PDOEntryUser, :PDOConsultantName, '', 1)");
    $stmtInsert->bindParam(':CId', $CId);
    $stmtInsert->bindParam(':PDOEntryUser', $EntryUser);
    $stmtInsert->bindParam(':PDOConsultantName', $ConsultantName);
    // $stmtInsert->bindParam(':PDOConsultantNumber', $ConsultantContact);
    $stmtInsert->execute();
    return $CId;
}



function updateClient($params) {
    global $pdo;
    $stmtUpdateClient = $pdo->prepare("UPDATE `client_table` SET `ConsultantId`= :PDOCId WHERE ID = :PDOClientID");
    foreach ($params as $key => &$val) {
        $stmtUpdateClient->bindParam($key, $val);
    }
    $stmtUpdateClient->execute();
}

try {
    // $ClientName = $_GET['JsonClientName'];
    // $ClientContact = $_GET['JsonClientContact'];
    $ConsultantName = isset($_GET['JsonConsultantName']) ? $_GET['JsonConsultantName'] : '';
    $ConsultantContact = isset($_GET['JsonConsultantContact']) ? $_GET['JsonConsultantContact'] : null;
    $ClientID = isset($_GET['JsonClientID']) ? $_GET['JsonClientID'] : '';
    $EntryUser = $_GET['JsonUserName'];

    $CId = 0;

    // if ($ConsultantContact !== '') {
        // $CId = fetchConsultantId($ConsultantContact, $ConsultantName);
        $CId = fetchConsultantId($ConsultantName);
        if ($CId == 0) {
            // $CId = insertConsultant($EntryUser, $ConsultantName, $ConsultantContact);
            $CId = insertConsultant($EntryUser, $ConsultantName);
        }
    // }

    if ($ClientID && $CId) {
        $updateClientParams = [
            ':PDOCId' => $CId,
            ':PDOClientID' => $ClientID,
        ];
        updateClient($updateClientParams);
        echo json_encode(["message" => "Updated Successfully!"]);
    } else {
        echo json_encode(["error" => "Error Updating Data"]);
    }

    
} catch (PDOException $e) {
    echo json_encode("Error Inserting Data: " . $e->getMessage());
    
}
?>
