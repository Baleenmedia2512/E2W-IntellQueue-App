<?php
require 'ConnectionManager.php';
$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Media';
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();
    
    // Fetch data from query parameters
    $userName = isset($_GET['JsonUsername']) ? $_GET['JsonUsername'] : '';
    $password = isset($_GET['JsonPassword']) ? $_GET['JsonPassword'] : '';
    $appRights = isset($_GET['JsonAppRights']) ? $_GET['JsonAppRights'] : '';
    $status = isset($_GET['JsonStatus']) ? $_GET['JsonStatus'] : '';
    $name = isset($_GET['JsonName']) ? $_GET['JsonName'] : '';
    $dateOfBirth = isset($_GET['JsonDOB']) ? $_GET['JsonDOB'] : '';
    $entryDate = isset($_GET['JsonEntryDate']) ? $_GET['JsonEntryDate'] : date('Y-m-d');
    $entryUser = isset($_GET['JsonEntryUser']) ? $_GET['JsonEntryUser'] : '';
    $contactNo = isset($_GET['JsonPhone']) ? $_GET['JsonPhone'] : '';
    $mailId = isset($_GET['JsonEmail']) ? $_GET['JsonEmail'] : '';
    $sex = isset($_GET['JsonSex']) ? $_GET['JsonSex'] : '';

    // Check if username already exists
    $stmtCheck = $pdo->prepare("SELECT COUNT(*) FROM employee_table WHERE userName = :PDOUserName");
    $stmtCheck->bindParam(':PDOUserName', $userName);
    $stmtCheck->execute();
    $count = $stmtCheck->fetchColumn();

    if ($count > 0) {
        // Username already exists, return a specific message
        echo json_encode("This Username not available");
    } else {
        // Insert the new employee data
        $stmtEmployeeTable = $pdo->prepare(
            "INSERT INTO employee_table 
            (`userName`, `password`, `AppRights`, `department`, `status`, `name`, `dateOfBirth`, `fathersName`, `fathersOccupation`, `nationality`, `religion`, `caste`, `idProof`, `addressProof`, `education`, `previousExperienceInMonths`, `dateOfJoining`, `MonthlyMarginTarget`, `MonthlyCallsTarget`, `probationTenureInMonths`, `panNumber`, `bankAccountNo`, `bankIfsc`, `salaryOnJoiningDate`, `entryDate`, `entryUser`, `designation`, `currentGrade`, `remarks`, `contactno`, `mail id`, `Sex`)
            VALUES 
            (:PDOUserName, :PDOPassword, :PDOAppRights, '', 'Active', :PDOName, :PDODateOfBirth, '', '', '', '', '', '', '', '', '', '0000-00-00', '', '', '', '', '', '', '', :PDOEntryDate, :PDOEntryUser, '', '', '', :PDOContactNo, :PDOEmail, :PDOSex)"
        );

        // Bind parameters
        $stmtEmployeeTable->bindParam(':PDOUserName', $userName);
        $stmtEmployeeTable->bindParam(':PDOPassword', $password);
        $stmtEmployeeTable->bindParam(':PDOAppRights', $appRights);
        $stmtEmployeeTable->bindParam(':PDOName', $name);
        $stmtEmployeeTable->bindParam(':PDODateOfBirth', $dateOfBirth);
        $stmtEmployeeTable->bindParam(':PDOEntryDate', $entryDate);
        $stmtEmployeeTable->bindParam(':PDOEntryUser', $entryUser);
        $stmtEmployeeTable->bindParam(':PDOContactNo', $contactNo);
        $stmtEmployeeTable->bindParam(':PDOEmail', $mailId);
        $stmtEmployeeTable->bindParam(':PDOSex', $sex);

        // Execute the query
        $stmtEmployeeTable->execute();
        
        echo json_encode("Employee Data Inserted Successfully!");
    }
} catch (PDOException $e) {
    echo json_encode("Error Inserting Data: " . $e->getMessage());
}
?>
