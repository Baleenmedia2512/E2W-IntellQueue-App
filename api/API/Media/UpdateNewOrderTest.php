<?php
require 'ConnectionManager.php';

// Get the database name
$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Test';
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();

    // Retrieve the parameters from the request
    $EntryUser = isset($_GET['JsonUserName']) ? $_GET['JsonUserName'] : '';
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
    $VendorName = isset($_GET['JsonVendorName']) ? $_GET['JsonVendorName'] : '';
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

 $SearchTerm = trim($OrderNumber)
              . ($RateWiseOrderNumber !== '' ? " - " . trim($RateWiseOrderNumber) : '')
              . ($OrderDate !== '' ? " - " . trim($OrderDate) : '')
              . ($ClientName !== '' ? " - " . trim($ClientName) : '')
              . ($Receivable !== '' ? " - ₹" . trim($Receivable) : '');

    // Ensure the entire string is trimmed after concatenation
    $SearchTerm = trim($SearchTerm);


    // Prepare the SQL statement to update the order details
    $stmtOrderTable = $pdo->prepare("
        UPDATE order_table SET 
            EntryDate = CURRENT_DATE,
            EntryUser = :PDOEntryUser,
            RateID = :PDORateId,
            OrderDate = :PDOOrderDate,
            ClientName = :PDOClientName,
            ClientContact = :PDOClientContact,
            Source = :PDOSource,
            Owner = :PDOOwner,
            CSE = :PDOCSE,
            Receivable = :PDOReceivable,
            Payable = :PDOPayable,
            CardRatePerUnit = :PDOCardRatePerUnit,
            ConsultantName = :PDOConsultantName,
            Margin = :PDOMargin,
            Card = :PDOCard,
            vendorName = :PDOVendorName,
            AdCategory = :PDOAdCategory,
            AdType = :PDOAdType,
            AdWidth = :PDOAdWidth,
            AdHeight = :PDOAdHeight,
            Location = :PDOLocation,
            Package = :PDOPackage,
            GST = :PDOGST,
            ClientGST = :PDOClientGST,
            ClientPAN = :PDOClientPAN,
            Address = :PDOAddress,
            ClientAuthorizedPerson = :PDOClientAuthorizedPerson,
            BookedStatus = :PDOBookedStatus,
            Units = :PDOUnits,
            MinPrice = :PDOMinPrice,
            DateOfFirstRelease = :PDODateOfFirstRelease,
            DateOfLastRelease = :PDODateOfLastRelease,
            ContactPerson = :PDOContactPerson,
            Remarks = :PDORemarks,
            AdjustedOrderAmount = :PDOAdjustedOrderAmount,
            SearchTerm = :PDOSearchTerm,
            Commission = :PDOCommission,
            IsCommissionAmountSingleUse = :PDOIsCommissionSingleUse, 
            ConsultantId = :PDOConsultantId
        WHERE OrderNumber = :PDOOrderNumber
    ");

    // Bind parameters
    $stmtOrderTable->bindParam(':PDOEntryUser', $EntryUser);
    $stmtOrderTable->bindParam(':PDOOrderNumber', $OrderNumber);
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

    echo json_encode("Values Updated Successfully!");
} catch (PDOException $e) {
    echo json_encode("Error Updating Data: " . $e->getMessage());
}
?>
