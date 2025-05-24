<?php
require 'ConnectionManager.php';
$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Test';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();
} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
    exit();
}

function insertConsultant($Params) {
    global $pdo;
    
    $stmtInsert = $pdo->prepare("INSERT INTO consultant_table (`CId`, `EntryDateTime`, `EntryUser`, `ConsultantName`, `ConsultantNumber`, `ConsultantPlace`,`Validity`, `LastSMSSent`, `IsSMSRequired`, `IsIncentiveRequired`,`SearchTerm`) VALUES (:PDOCId, CURRENT_TIMESTAMP, :PDOEntryUser, :PDOConsultantName, :PDOConsultantNumber, :PDOConsultantPlace ,1, '0000-00-00', :PDOSmsRequired, :PDOIcRequired, :PDOSearchTerm)");

    foreach ($Params as $key => &$val) {
        $stmtInsert->bindParam($key, $val);
    }

    $stmtInsert->execute();
}

function updateConsultant($Params) {
    global $pdo;
    $stmtUpdate = $pdo->prepare("UPDATE `consultant_table` SET `EntryDateTime`= CURRENT_TIMESTAMP,`EntryUser`= :PDOEntryUser,`ConsultantName`= :PDOConsultantName,`ConsultantNumber`= :PDOConsultantNumber, `ConsultantPlace`= :PDOConsultantPlace, `IsSMSRequired`= :PDOSmsRequired,`IsIncentiveRequired`= :PDOIcRequired,`SearchTerm`= :PDOSearchTerm WHERE `CId` = :PDOCId");
    foreach ($Params as $key => &$val) {
        $stmtUpdate->bindParam($key, $val);
    }
    $stmtUpdate->execute();
}


try {
    $EntryUser = $_GET['JsonUserName'];
    $ConsultantID = isset($_GET['JsonConsultantId']) ? $_GET['JsonConsultantId'] : '';
    $ConsultantName = isset($_GET['JsonConsultantName']) ? $_GET['JsonConsultantName'] : '';
    $ConsultantContact = isset($_GET['JsonConsultantContact']) ? $_GET['JsonConsultantContact'] : '';
    $ConsultantPlace = isset($_GET['JsonConsultantPlace']) ? $_GET['JsonConsultantPlace'] : '';
    $SmsRequired = isset($_GET['JsonSmsRequired']) ? $_GET['JsonSmsRequired'] : '';
    $IcRequired = isset($_GET['JsonIcRequired']) ? $_GET['JsonIcRequired'] : '';

    $SearchConcat = trim($ConsultantID) 
              . ($ConsultantName !== '' ? " - " . trim($ConsultantName) : '') 
              . ($ConsultantContact !== '' ? " - " . trim($ConsultantContact) : " - 0")
              . ($ConsultantPlace !== '' ? " - " . trim($ConsultantPlace) : '');


    $SearchTerm = trim($SearchConcat);

    

    if ($ConsultantID) {
        $updateConsultantParams = [
            ':PDOCId' => $ConsultantID,
            ':PDOEntryUser' => $EntryUser,
            ':PDOConsultantName' => $ConsultantName,
            ':PDOConsultantNumber' => $ConsultantContact,
            ':PDOConsultantPlace' => $ConsultantPlace,
            ':PDOSmsRequired' => $SmsRequired,
            ':PDOIcRequired' => $IcRequired,
            ':PDOSearchTerm' => $SearchTerm,
        ];
        updateConsultant($updateConsultantParams);
        echo json_encode(["message" => "Updated Successfully!"]);
    } else {
        global $pdo;
        $stmtId = $pdo->prepare("SELECT MAX(CId) as CId FROM consultant_table");
        $stmtId->execute();
        $result = $stmtId->fetch(PDO::FETCH_ASSOC);
        $CId = ($result !== false) ? $result['CId'] + 1 : 0;
        $InsertSearchConcat = trim($CId) 
              . ($ConsultantName !== '' ? " - " . trim($ConsultantName) : '') 
              . ($ConsultantContact !== '' ? " - " . trim($ConsultantContact) : " - 0")
              . (" - Valid" );


        $InsertSearchTerm = trim($InsertSearchConcat);
        $insertConsultantParams = [
            ':PDOCId' => $CId,
            ':PDOEntryUser' => $EntryUser,
            ':PDOConsultantName' => $ConsultantName,
            ':PDOConsultantNumber' => $ConsultantContact,
            ':PDOConsultantPlace' => $ConsultantPlace,
            ':PDOSmsRequired' => $SmsRequired,
            ':PDOIcRequired' => $IcRequired,
            ':PDOSearchTerm' => $InsertSearchTerm,
        ];
         try {
            insertConsultant($insertConsultantParams);
            echo json_encode(["message" => "Inserted Successfully!"]);
        } catch (PDOException $e) {
            if ($e->getCode() == 23000) {
                if (strpos($e->getMessage(), 'ConsultantName') !== false) {
                    echo json_encode(["error" => "Consultant name already exists!"]);
                } elseif (strpos($e->getMessage(), 'ConsultantNumber') !== false) {
                    echo json_encode(["error" => "Consultant number already exists!"]);
                } else {
                    echo json_encode(["error" => "Duplicate entry detected. Please check the data and try again."]);
                }
            } else {
                echo json_encode(["error" => "Error Inserting Data: " . $e->getMessage()]);
            }
        }
    }

    
} catch (PDOException $e) {
    echo json_encode("Error Inserting Data: " . $e->getMessage());
    
}
?>
