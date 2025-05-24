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

function fetchConsultantId($ConsultantContact, $ConsultantName, $ConsultantPlace) {
    global $pdo;
    // if (empty($ConsultantContact) && $ConsultantContact === '' && $ConsultantName !== '' && !$ConsultantName) {
    //     // If ConsultantContact is empty and ConsultantName is not empty, run this query
    //     $stmt = $pdo->prepare("SELECT CId FROM consultant_table WHERE ConsultantName = :PDOConsultantName AND ConsultantNumber IS NULL;");
    //     $stmt->bindParam(':PDOConsultantName', $ConsultantName);

    // } elseif ($ConsultantName !== '' || !$ConsultantName) {
    //     // If ConsultantName is empty, run this query
    //     $stmt = $pdo->prepare("SELECT CId FROM consultant_table WHERE ConsultantName = :PDOConsultantName;");
    //     $stmt->bindParam(':PDOConsultantName', $ConsultantName);
        
    // } else {
    //     // If ConsultantContact is not empty, run the existing query
    //     $stmt = $pdo->prepare("SELECT CId FROM consultant_table WHERE ConsultantName = :PDOConsultantName AND (ConsultantNumber = :PDOConsultantNumber OR ConsultantNumber IS NULL);");
    //     $stmt->bindParam(':PDOConsultantName', $ConsultantName);
    //     $stmt->bindParam(':PDOConsultantNumber', $ConsultantContact);
    // }
    $stmt = $pdo->prepare("SELECT CId FROM consultant_table WHERE ConsultantName = :PDOConsultantName AND (ConsultantNumber = :PDOConsultantNumber OR ConsultantNumber IS NULL) AND ConsultantPlace = :PDOConsultantPlace");
    $stmt->bindParam(':PDOConsultantName', $ConsultantName);
    $stmt->bindParam(':PDOConsultantNumber', $ConsultantContact);
    $stmt->bindParam(':PDOConsultantPlace', $ConsultantPlace);
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    return $result !== false ? $result['CId'] : 0;
}


// function fetchConsultantId($ConsultantContact, $ConsultantName) {
//     global $pdo;
//     $stmt = $pdo->prepare("SELECT CId FROM consultant_table WHERE ConsultantName = :PDOConsultantName AND ConsultantNumber = :PDOConsultantNumber");
//     $stmt->bindParam(':PDOConsultantName', $ConsultantName);
//     $stmt->bindParam(':PDOConsultantNumber', $ConsultantContact);
//     $stmt->execute();
//     $result = $stmt->fetch(PDO::FETCH_ASSOC);
//     return $result !== false ? $result['CId'] : 0;
// }

function insertConsultant($EntryUser, $ConsultantName, $ConsultantContact, $ConsultantPlace) {
    global $pdo;
    $stmtId = $pdo->prepare("SELECT MAX(CId) as CId FROM consultant_table");
    $stmtId->execute();
    $result = $stmtId->fetch(PDO::FETCH_ASSOC);
    $CId = ($result !== false) ? $result['CId'] + 1 : 0;
    $SearchConcat = trim(isset($CId) ? $CId : '') 
              . (isset($ConsultantName) && $ConsultantName !== '' ? " - " . trim($ConsultantName) : '') 
              . (isset($ConsultantContact) && $ConsultantContact !== '' ? " - " . trim($ConsultantContact) : " - 0")
              . (isset($ConsultantPlace) && $ConsultantPlace !== '' ? " - " . trim($ConsultantPlace) : '');
    $SearchTerm = trim($SearchConcat);
    $stmtInsert = $pdo->prepare("INSERT INTO consultant_table (CId, EntryDateTime, EntryUser, ConsultantName, ConsultantNumber, ConsultantPlace, Validity, SearchTerm) VALUES (:CId, CURRENT_TIMESTAMP, :PDOEntryUser, :PDOConsultantName, :PDOConsultantNumber, :PDOConsultantPlace, 1, :PDOSearchTerm)");
    $stmtInsert->bindParam(':CId', $CId);
    $stmtInsert->bindParam(':PDOEntryUser', $EntryUser);
    $stmtInsert->bindParam(':PDOConsultantName', $ConsultantName);
    $stmtInsert->bindParam(':PDOConsultantNumber', $ConsultantContact);
    $stmtInsert->bindParam(':PDOConsultantPlace', $ConsultantPlace);
    $stmtInsert->bindParam(':PDOSearchTerm', $SearchTerm);
    $stmtInsert->execute();
    return $CId;
}

// function updateConsultant($EntryUser, $ConsultantName, $ConsultantContact, $ConsultantPlace, $CId) {
//     global $pdo;
//     $stmtUpdate = $pdo->prepare("UPDATE `consultant_table` SET `EntryUser`= :PDOEntryUser,`ConsultantName`= :PDOConsultantName,`ConsultantNumber`= :PDOConsultantNumber,`ConsultantPlace`= :PDOConsultantPlace WHERE `CId` = :PDOCId;");
//     $stmtUpdate->bindParam(':PDOCId', $CId);
//     $stmtUpdate->bindParam(':PDOEntryUser', $EntryUser);
//     $stmtUpdate->bindParam(':PDOConsultantName', $ConsultantName);
//     $stmtUpdate->bindParam(':PDOConsultantNumber', $ConsultantContact);
//     $stmtInsert->bindParam(':PDOConsultantPlace', $ConsultantPlace);
//     $stmtUpdate->execute();
// }

function checkClientContactCount($ClientContact, $ClientName) {
    global $pdo;
    $stmtContact = $pdo->prepare("SELECT COUNT(*) as ContactCount FROM client_table WHERE ClientContact = :PDOClientContact AND ClientName = :PDOClientName");
    $stmtContact->bindParam(':PDOClientContact', $ClientContact);
    $stmtContact->bindParam(':PDOClientName', $ClientName);
    $stmtContact->execute();
    $result = $stmtContact->fetch(PDO::FETCH_ASSOC);
    return $result !== false ? $result['ContactCount'] : 0;
}

function insertClient($params) {
    global $pdo;
    $stmtEnquiryTable = $pdo->prepare("INSERT INTO client_table VALUES ('', CURRENT_TIMESTAMP, :PDOEntryUser, :PDOClientContact,  1, 1, CURRENT_TIMESTAMP, :PDOSource, :PDOTitle, :PDOClientName, :PDOClientEmail, :PDOAge, :PDOClientAgeFormat, :PDODOB, :PDOAddress, :PDOClientGST, :PDOClientPAN, :PDOCId, :PDOClientContactPerson, :PDOGender)");
    foreach ($params as $key => &$val) {
        $stmtEnquiryTable->bindParam($key, $val);
    }
    $stmtEnquiryTable->execute();
}

function insertEnquiry($params) {
    global $pdo;
    $stmtEnquiryTable = $pdo->prepare("INSERT INTO enquiry_table VALUES ('', CURRENT_TIMESTAMP, :PDOEntryUser, :PDOClientContact, :PDOEntryUser,  1, 1, CURRENT_TIMESTAMP, :PDOSource, '', :PDOClientName, :PDOClientEmail, :PDOClientTitle, :PDOClientAge, :PDOClientDOB, :PDOClientAddress, :PDOClientGST, :PDOClientPAN, :PDOCId, :PDOClientContactPerson, :PDOGender)");
    foreach ($params as $key => &$val) {
        $stmtEnquiryTable->bindParam($key, $val);
    }
    $stmtEnquiryTable->execute();
}

function updateClient($params) {
    global $pdo;
    $stmtUpdateClient = $pdo->prepare("UPDATE `client_table` SET `EntryDateTime`= CURRENT_TIMESTAMP ,`EntryUser`= :PDOEntryUser,`Attended`= 1,`Validity`= 1,`AttendedDateTime`= CURRENT_TIMESTAMP,`Source`= :PDOSource,`Title`= :PDOClientTitle,`ClientName`= :PDOClientName,`ClientContact`= :PDOClientContact,`ClientEmail`= :PDOClientEmail,`Age`= :PDOClientAge,`AgeFormat` = :PDOClientAgeFormat,`DOB`= :PDOClientDOB,`Address`= :PDOClientAddress,`ClientGST`= :PDOClientGST,`ClientPAN`= :PDOClientPAN,`ConsultantId`= :PDOCId, `ClientContactPerson` = :PDOClientContactPerson, `Gender` = :PDOGender WHERE ID = :PDOClientID");
    foreach ($params as $key => &$val) {
        $stmtUpdateClient->bindParam($key, $val);
    }
    $stmtUpdateClient->execute();
}

try {
    $IsNewClient = $_GET['JsonIsNewClient'];
    $EntryUser = $_GET['JsonUserName'];
    $ClientName = $_GET['JsonClientName'];
    $ClientEmail = isset($_GET['JsonClientEmail']) ? $_GET['JsonClientEmail'] : '';
    $ClientContact = isset($_GET['JsonClientContact']) && $_GET['JsonClientContact'] !== ''? $_GET['JsonClientContact'] : null;
    $Source = $_GET['JsonSource'];
    $Age = isset($_GET['JsonAge']) ? $_GET['JsonAge'] : '';
    $DOB = isset($_GET['JsonDOB']) ? $_GET['JsonDOB'] : '';
    $Address = isset($_GET['JsonAddress']) ? $_GET['JsonAddress'] : '';
    $Title = isset($_GET['JsonTitle']) ? $_GET['JsonTitle'] : '';
    $ConsultantName = isset($_GET['JsonConsultantName']) ? $_GET['JsonConsultantName'] : null;
    $ConsultantContact = isset($_GET['JsonConsultantContact']) ? $_GET['JsonConsultantContact'] : null;
    $ConsultantPlace = isset($_GET['JsonConsultantPlace']) ? $_GET['JsonConsultantPlace'] : null;
    $ClientGST = isset($_GET['JsonClientGST']) ? $_GET['JsonClientGST'] : '';
    $ClientPAN = isset($_GET['JsonClientPAN']) ? $_GET['JsonClientPAN'] : '';
    $ClientID = isset($_GET['JsonClientID']) ? $_GET['JsonClientID'] : '';
    $ClientContactPerson = isset($_GET['JsonClientContactPerson']) ? $_GET['JsonClientContactPerson'] : '';
    $Gender = isset($_GET['JsonGender']) ? $_GET['JsonGender'] : '';

    $CId = 0;
    $ContactCount = 0;
    $AgeFormat = (stripos($Title, 'Baby.') !== false || stripos($Title, 'B/o.') !== false) ? 'Months' : 'Years';

    
    $CId = fetchConsultantId($ConsultantContact, $ConsultantName, $ConsultantPlace);
    if ($CId == 0 && $ConsultantName) {
        $CId = insertConsultant($EntryUser, $ConsultantName, $ConsultantContact, $ConsultantPlace);
    // } else {
    //     if ($ConsultantName !== '') {
    //     updateConsultant($EntryUser, $ConsultantName, $ConsultantContact, $ConsultantPlace, $CId);
    //     }
    }

    if ($ClientID === '' && $ClientContact !== '') {
    $ContactCount = checkClientContactCount($ClientContact, $ClientName);
    }
         $insertClientParams = [
        ':PDOEntryUser' => $EntryUser,
        ':PDOClientName' => $ClientName,
        ':PDOClientEmail' => $ClientEmail,
        ':PDOClientContact' => $ClientContact,
        ':PDOSource' => $Source,
        ':PDOTitle' => $Title,
        ':PDOAge' => $Age,
        ':PDOClientAgeFormat' => $AgeFormat,
        ':PDODOB' => $DOB,
        ':PDOAddress' => $Address,
        ':PDOClientGST' => $ClientGST,
        ':PDOClientPAN' => $ClientPAN,
        ':PDOCId' => $CId,
        ':PDOClientContactPerson' => $ClientContactPerson,
        ':PDOGender' => $Gender
    ];

         $insertEnquiryParams = [
        ':PDOEntryUser' => $EntryUser,
        ':PDOClientName' => $ClientName,
        ':PDOClientEmail' => $ClientEmail,
        ':PDOClientContact' => $ClientContact,
        ':PDOSource' => $Source,
        ':PDOClientTitle' => $Title,
        ':PDOClientAge' => $Age,
        ':PDOClientDOB' => $DOB,
        ':PDOClientAddress' => $Address,
        ':PDOClientGST' => $ClientGST,
        ':PDOClientPAN' => $ClientPAN,
        ':PDOCId' => $CId,
        ':PDOClientContactPerson' => $ClientContactPerson,
        ':PDOGender' => $Gender
    ];

       $updateClientParams = [
        ':PDOEntryUser' => $EntryUser,
        ':PDOClientName' => $ClientName,
        ':PDOClientEmail' => $ClientEmail,
        ':PDOClientContact' => $ClientContact,
        ':PDOSource' => $Source,
        ':PDOClientTitle' => $Title,
        ':PDOClientAge' => $Age,
        ':PDOClientAgeFormat' => $AgeFormat,
        ':PDOClientDOB' => $DOB,
        ':PDOClientAddress' => $Address,
        ':PDOClientGST' => $ClientGST,
        ':PDOClientPAN' => $ClientPAN,
        ':PDOCId' => $CId,
        ':PDOClientID' => $ClientID,
        ':PDOClientContactPerson' => $ClientContactPerson,
        ':PDOGender' => $Gender
    ];

    try {
        if ($ContactCount > 0 || $ClientID !== '') {
            updateClient($updateClientParams);
            insertEnquiry($insertEnquiryParams);
            echo json_encode(["message" => "Values Inserted Successfully!", "CId" => $CId]);
        } else {
            insertClient($insertClientParams);
            insertEnquiry($insertEnquiryParams);
            echo json_encode(["message" => "Values Inserted Successfully!", "CId" => $CId]);
        }
    } catch (PDOException $e) {
        if ($e->getCode() == '23000' && $ClientContact === null) {
            echo json_encode(["message" => "Values Inserted Successfully!", "CId" => $CId]);
        } elseif ($e->getCode() == '23000' && $ClientContact !== null) {
            echo json_encode(["message" => "Duplicate Entry!", "CId" => $CId]);
        } else {
            throw $e;
        }
    }

} catch (PDOException $e) {
    // Catch specific duplicate entry for ConsultantNumber
        if ($e->getCode() == '23000' && strpos($e->getMessage(), 'ConsultantNumber') !== false) {
            echo json_encode(["message" => "Consultant Name Already Exists!"]);
        } elseif ($e->getCode() == '23000' && strpos($e->getMessage(), 'ConsultantName') !== false) {
            echo json_encode(["message" => "Consultant Name Already Exists!"]);
        } else {
                echo json_encode("Error Inserting Data: " . $e->getMessage());
        }
}
?>
