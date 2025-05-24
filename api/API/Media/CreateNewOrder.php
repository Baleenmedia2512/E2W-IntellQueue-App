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
    $EntryUser = $_GET['JsonUserName']; //Get User Name
    $OrderNumber = isset($_GET['JsonOrderNumber']) ? $_GET['JsonOrderNumber'] : '';
    $RateWiseOrderNumber = isset($_GET['JsonRateWiseOrderNumber']) ? $_GET['JsonRateWiseOrderNumber'] : '';
    $RateID = isset($_GET['JsonRateId']) ? $_GET['JsonRateId'] : '';
    $ClientName = isset($_GET['JsonClientName']) ? $_GET['JsonClientName'] : '';
    $ClientContact = isset($_GET['JsonClientContact']) ? $_GET['JsonClientContact'] : '';
    $Source = isset($_GET['JsonClientSource']) ? $_GET['JsonClientSource'] : '';
    $Owner = isset($_GET['JsonOwner']) ? $_GET['JsonOwner'] : '';
    $CSE = isset($_GET['JsonCSE']) ? $_GET['JsonCSE'] : '';
    $Receivable = isset($_GET['JsonReceivable']) ? $_GET['JsonReceivable'] : '';
    $Payable = isset($_GET['JsonPayable']) ? $_GET['JsonPayable'] : '';
    $CardRatePerUnit = isset($_GET['JsonRatePerUnit']) ? $_GET['JsonRatePerUnit'] : '';
    $ConsultantName = isset($_GET['JsonConsultantName']) ? $_GET['JsonConsultantName'] : '';
    $MarginAmount = isset($_GET['JsonMarginAmount']) ? $_GET['JsonMarginAmount'] : '';
    $RateName = isset($_GET['JsonRateName']) ? $_GET['JsonRateName'] : '';
    $VendorName= isset($_GET['JsonVendorName']) ? $_GET['JsonVendorName'] : '';
    $AdCategory = isset($_GET['JsonCategory']) ? $_GET['JsonCategory'] : '';
    $AdType = isset($_GET['JsonType']) ? $_GET['JsonType'] : '';
    $AdHeight = isset($_GET['JsonHeight']) ? $_GET['JsonHeight'] : '1.0';
    $AdWidth = isset($_GET['JsonWidth']) ? $_GET['JsonWidth'] : '1.0';
    $Location = isset($_GET['JsonLocation']) ? $_GET['JsonLocation'] : '';
    $Package = isset($_GET['JsonPackage']) ? $_GET['JsonPackage'] : '';
    $GST = isset($_GET['JsonGST']) ? $_GET['JsonGST'] : '';
    $ClientGST = isset($_GET['JsonClientGST']) ? $_GET['JsonClientGST'] : '';
    $ClientPAN = isset($_GET['JsonClientPAN']) ? $_GET['JsonClientPAN'] : '';
    $Address = isset($_GET['JsonClientAddress']) ? $_GET['JsonClientAddress'] : '';
    // $ClientEmail = isset($_GET['JsonClientEmail']) ? $_GET['JsonClientEmail'] : '';
    $BookedStatus = 'Booked';
    $Units = isset($_GET['JsonUnits']) ? $_GET['JsonUnits'] : '';
    $MinPrice = isset($_GET['JsonMinPrice']) ? $_GET['JsonMinPrice'] : '';
    $Remarks = isset($_GET['JsonRemarks']) ? $_GET['JsonRemarks'] : '';
    $ContactPerson = isset($_GET['JsonContactPerson']) ? $_GET['JsonContactPerson'] : '';
    $ReleaseDates = isset($_GET['JsonReleaseDates']) ? $_GET['JsonReleaseDates'] : '';
    $ClientAuthorizedPerson = isset($_GET['JsonClientAuthorizedPersons']) ? $_GET['JsonClientAuthorizedPersons'] : '';
    $OrderDate = isset($_GET['JsonOrderDate']) ? $_GET['JsonOrderDate'] : date('Y-m-d');
    $AdjustedOrderAmount = isset($_GET['JsonAdjustedOrderAmount']) ? $_GET['JsonAdjustedOrderAmount'] : '';
    $Commission = isset($_GET['JsonCommission']) ? $_GET['JsonCommission'] : '';
    $IsCommissionSingleUse = isset($_GET['JsonIsCommissionSingleUse']) ? $_GET['JsonIsCommissionSingleUse'] : '';
    $ConsultantId = isset($_GET['JsonConsultantId']) ? $_GET['JsonConsultantId'] : '';

    $stmtEnquiryTable = null;

    $SearchTerm = trim($OrderNumber)
              . ($RateWiseOrderNumber !== '' ? " - " . trim($RateWiseOrderNumber) : '')
              . ($OrderDate !== '' ? " - " . trim($OrderDate) : '')
              . ($ClientName !== '' ? " - " . trim($ClientName) : '')
              . ($Receivable !== '' ? " - ₹" . trim($Receivable) : '');

    // Ensure the entire string is trimmed after concatenation
    $SearchTerm = trim($SearchTerm);



    $stmtOrderTable = $pdo->prepare("INSERT INTO order_table (`EntryDate`, `EntryUser`, `OrderNumber`, `RateID`, `OrderDate`, `ClientName`, `ClientContact`, `Source`, `Owner`, `CSE`, `Receivable`, `Payable`, `CardRatePerUnit`, `ConsultantName`, `Margin`, `Card`, `vendorName`, `AdCategory`, `AdType`, `AdWidth`, `AdHeight`, `Location`, `Package`, `GST`, `ClientGST`, `ClientPAN`, `Address`, `ClientAuthorizedPerson`, `BookedStatus`, `Units`, `MinPrice`, `DateOfFirstRelease`, `DateOfLastRelease`, `ContactPerson`, `Remarks`, `RateWiseOrderNumber`, `AdjustedOrderAmount`,`SearchTerm`, `Commission`, `IsCommissionAmountSingleUse`, `ConsultantId`)VALUES (CURRENT_TIMESTAMP, :PDOEntryUser, :PDOOrderNumber, :PDORateId, :PDOOrderDate, :PDOClientName, :PDOClientContact,  :PDOSource, :PDOOwner, :PDOCSE, :PDOReceivable, :PDOPayable, :PDOCardRatePerUnit, :PDOConsultantName, :PDOMargin, :PDOCard, :PDOVendorName, :PDOAdCategory, :PDOAdType, :PDOAdWidth, :PDOAdHeight, :PDOLocation, :PDOPackage, :PDOGST, :PDOClientGST, :PDOClientPAN, :PDOAddress, :PDOClientAuthorizedPerson, :PDOBookedStatus, :PDOUnits, :PDOMinPrice, :PDODateOfFirstRelease, :PDODateOfLastRelease, :PDOContactPerson, :PDORemarks, :PDORateWiseOrderNumber, :PDOAdjustedOrderAmount, :PDOSearchTerm, :PDOCommission, :PDOIsCommissionSingleUse, :PDOConsultantId)"); 
    $stmtOrderTable->bindParam(':PDOEntryUser', $EntryUser);
    $stmtOrderTable->bindParam(':PDOOrderNumber', $OrderNumber);
    $stmtOrderTable->bindParam(':PDORateWiseOrderNumber', $RateWiseOrderNumber);
    $stmtOrderTable->bindParam(':PDORateId', $RateID);
    $stmtOrderTable->bindParam(':PDOClientName', $ClientName);
    $stmtOrderTable->bindParam(':PDOClientContact', $ClientContact);
    $stmtOrderTable->bindParam(':PDOSource', $Source);
    $stmtOrderTable->bindParam(':PDOOwner', $Owner);
    $stmtOrderTable->bindParam(':PDOCSE', $CSE);
    $stmtOrderTable->bindParam(':PDOReceivable', $Receivable);
    $stmtOrderTable->bindParam(':PDOPayable', $Payable);
    $stmtOrderTable->bindParam(':PDOCardRatePerUnit', $CardRatePerUnit);
    $stmtOrderTable->bindParam(':PDOConsultantName', $ConsultantName);
    $stmtOrderTable->bindParam(':PDOMargin', $MarginAmount);
    $stmtOrderTable->bindParam(':PDOCard', $RateName);
    $stmtOrderTable->bindParam(':PDOVendorName', $VendorName);
    $stmtOrderTable->bindParam(':PDOAdCategory', $AdCategory);
    $stmtOrderTable->bindParam(':PDOAdType', $AdType);
    $stmtOrderTable->bindParam(':PDOAdWidth', $AdWidth);
    $stmtOrderTable->bindParam(':PDOAdHeight', $AdHeight);
    $stmtOrderTable->bindParam(':PDOLocation', $Location);
    $stmtOrderTable->bindParam(':PDOPackage', $Package);
    $stmtOrderTable->bindParam(':PDOGST', $GST);
    $stmtOrderTable->bindParam(':PDOClientGST', $ClientGST);
    $stmtOrderTable->bindParam(':PDOClientPAN', $ClientPAN);
    $stmtOrderTable->bindParam(':PDOAddress', $Address);
    // $stmtOrderTable->bindParam(':PDOClientEmail', $ClientEmail);
    $stmtOrderTable->bindParam(':PDOClientAuthorizedPerson', $ClientAuthorizedPerson);
    $stmtOrderTable->bindParam(':PDOBookedStatus', $BookedStatus);
    $stmtOrderTable->bindParam(':PDOUnits', $Units);
    $stmtOrderTable->bindParam(':PDOMinPrice', $MinPrice);
    $stmtOrderTable->bindParam(':PDODateOfFirstRelease', $ReleaseDates);
    $stmtOrderTable->bindParam(':PDODateOfLastRelease', $ReleaseDates);
    $stmtOrderTable->bindParam(':PDOContactPerson', $ContactPerson);
    $stmtOrderTable->bindParam(':PDORemarks', $Remarks);
    $stmtOrderTable->bindParam(':PDOOrderDate', $OrderDate);
    $stmtOrderTable->bindParam(':PDOAdjustedOrderAmount', $AdjustedOrderAmount);
    $stmtOrderTable->bindParam(':PDOSearchTerm', $SearchTerm);
    $stmtOrderTable->bindParam(':PDOCommission', $Commission);
    $stmtOrderTable->bindParam(':PDOIsCommissionSingleUse', $IsCommissionSingleUse);
    $stmtOrderTable->bindParam(':PDOConsultantId', $ConsultantId);
    // Execute the query
    $stmtOrderTable->execute();
    
    echo json_encode("Values Inserted Successfully!");
} catch (PDOException $e) {
    echo json_encode("Error Inserting Data:  " . $e->getMessage());
}
//  $stmtOrderTable = $pdo->prepare("INSERT INTO order_table_Backup (`EntryDate`, `EntryUser`, `RateID`, `OrderDate`, `ClientName`, `ClientContact`, `Source`, `Owner`, `CSE`, `BDE`, `Receivable`, `Payable`, `CardRatePerUnit`, `ConsultantName`, `Margin`, `Card`, `vendorName`, `AdCategory`, `AdType`, `AdWidth`, `AdHeight`, `Position`, `GST`, `ClientGST`, `ClientPAN`, `DoorStreet`, `ClientAuthorizedPerson`, `BookedStatus`, `Units`, `MinPrice`, `DateOfFirstRelease`, `DateOfLastRelease`, `ContactPerson`, `Remarks`)VALUES (CURRENT_DATE, :PDOEntryUser, :PDORateId, CURRENT_DATE, :PDOClientName, :PDOClientContact,  :PDOSource, :PDOOwner, :PDOCSE, :PDOBDE, :PDOReceivable, :PDOPayable, :PDOCardRatePerUnit, :PDOConsultantName, :PDOMargin, :PDOCard, :PDOVendorName, :PDOAdCategory, :PDOAdType, :PDOAdWith, :PDOAdHeight, :PDOPosition, :PDOGST, :PDOClientGST, :PDOClientPAN, :PDODoorStreet, :PDOClientAuthorizedPerson, :PDOBookedStatus, :PDOUnits, :PDOMinPrice, :PDODateOfFirstRelease, :PDODateOfLastRelease, :PDOContactPerson, :PDORemarks)"); 
?>