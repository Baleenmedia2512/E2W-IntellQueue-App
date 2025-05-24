<?php
require 'ConnectionManager.php';
$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Media';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();
    
    $EntryUser = $_GET['JsonUserName']; //Get User Name
    $ClientName = $_GET['JsonClientName'];
    $ClientEmail = $_GET['JsonClientEmail'];
    $ClientContact = $_GET['JsonClientContact'];
    $LeadDays = $_GET['JsonLeadDays'];
    $Source = $_GET['JsonSource'];
    $AdMedium = $_GET['JsonAdMedium'];
    $AdType = $_GET['JsonAdType'];
    $AdCategory = $_GET['JsonAdCategory'];
    $Quantity = $_GET['JsonQuantity'];
    $Units = $_GET['JsonUnits'];
    $AmountwithoutGst = $_GET['JsonAmountwithoutGst'];
    $Amount = $_GET['JsonAmount'];
    $GSTAmount = $_GET['JsonGSTAmount'];
    $GST = $_GET['JsonGST'];
    $Rateperunit = $_GET['JsonRatePerUnit'];
    $DiscountAmount = $_GET['JsonDiscountAmount'];
    $Remarks = isset($_GET['JsonRemarks']) ? $_GET['JsonRemarks']: '';

    //Fetch Last quote Id
    $stmt = $pdo -> prepare("SELECT MAX(QuoteID) As VALUE1 from quote_cart_mapping_table");
    $stmt->execute();

    // Fetch the results
    $results = $stmt->fetch();
    $quoteId = $results["VALUE1"] + 1;

    //Fetch Last Cart Id 
    $stmt = $pdo -> prepare("SELECT MAX(CartID) As VALUE1 from cart_table");
    $stmt->execute();

    // Fetch the results
    $results = $stmt->fetch();
    $cartId = $results["VALUE1"] + 1;

    $stmtQuoteTable = $pdo->prepare("INSERT INTO quote_table VALUES (CURRENT_DATE, :PDOEntryUser, '', :PDOClientName, :PDOClientEmail, :PDOClientContact, '', :PDOLeadDays, :PDOSource, :PDORemarks)");
    $stmtQuoteTable->bindParam(':PDOEntryUser', $EntryUser);
    $stmtQuoteTable->bindParam(':PDOClientName', $ClientName);
    $stmtQuoteTable->bindParam(':PDOClientEmail', $ClientEmail);
    $stmtQuoteTable->bindParam(':PDOClientContact', $ClientContact);
    $stmtQuoteTable->bindParam(':PDOLeadDays', $LeadDays);
    $stmtQuoteTable->bindParam(':PDOSource', $Source);
    $stmtQuoteTable->bindParam(':PDORemarks', $Remarks);
    // Execute the query
    $stmtQuoteTable->execute();

    $stmtCartTable = $pdo->prepare("INSERT INTO cart_table (adMedium, adType, adCategory, Quantity, Units, AmountwithoutGst, Amount, GSTAmount, `GST%`, entryUser, `Valid Status`, rateperunit, DiscountAmount) VALUES (:PDOAdMedium, :PDOAdType, :PDOAdCategory, :PDOQuantity, :PDOUnits, :PDOAmountwithoutGst, :PDOAmount, :PDOGSTAmount, :PDOGst, :PDOEntryUser, 'Valid', :PDORatePerUnit, :PDODiscountAmount)");
    $stmtCartTable->bindParam(':PDOAdMedium', $AdMedium);
    $stmtCartTable->bindParam(':PDOAdType', $AdType);
    $stmtCartTable->bindParam(':PDOAdCategory', $AdCategory);
    $stmtCartTable->bindParam(':PDOQuantity', $Quantity);
    $stmtCartTable->bindParam(':PDOUnits', $Units);
    $stmtCartTable->bindParam(':PDOAmountwithoutGst', $AmountwithoutGst);
    $stmtCartTable->bindParam(':PDOAmount', $Amount);
    $stmtCartTable->bindParam(':PDOGSTAmount', $GSTAmount);
    $stmtCartTable->bindParam(':PDOGst', $GST);
    $stmtCartTable->bindParam(':PDOEntryUser', $EntryUser);
    $stmtCartTable->bindParam(':PDORatePerUnit', $Rateperunit);
    $stmtCartTable->bindParam(':PDODiscountAmount', $DiscountAmount);
    // Execute the query
    $stmtCartTable->execute();

    $stmtQuoteCartMapping = $pdo->prepare("INSERT INTO quote_cart_mapping_table VALUES (CURRENT_DATE, :PDOEntryUser, '', :PDOQuoteId, :PDOCartId, 'Followup', '', CURRENT_DATE + INTERVAL 1 DAY)");
    $stmtQuoteCartMapping->bindParam(':PDOEntryUser', $EntryUser);
    $stmtQuoteCartMapping->bindParam(':PDOQuoteId', $quoteId);
    $stmtQuoteCartMapping->bindParam(':PDOCartId', $cartId);
    // Execute the query
    $stmtQuoteCartMapping->execute();
    
    echo json_encode("Values Inserted Successfully!");
} catch (PDOException $e) {
    echo json_encode("Error Inserting Data:  " . $e->getMessage());
} 