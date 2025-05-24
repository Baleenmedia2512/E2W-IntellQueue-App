<?php
require 'ConnectionManager.php';
$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Test';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();

    // Retrieve parameters
    $transactionType = isset($_GET['JsonTransactionType']) ? $_GET['JsonTransactionType'] : '';
    $username = isset($_GET['JsonEntryUser']) ? $_GET['JsonEntryUser'] : '';
    $orderNumber = isset($_GET['JsonOrderNumber']) ? $_GET['JsonOrderNumber'] : '';
    $orderAmount = isset($_GET['JsonOrderAmount']) ? $_GET['JsonOrderAmount'] : '';
    $taxType = isset($_GET['JsonTaxType']) ? $_GET['JsonTaxType'] : '';
    $gstAmount = isset($_GET['JsonGSTAmount']) ? $_GET['JsonGSTAmount'] : '';
    $expenseCategory = isset($_GET['JsonExpenseCategory']) ? $_GET['JsonExpenseCategory'] : '';
    $remarks = isset($_GET['JsonRemarks']) ? $_GET['JsonRemarks'] : '';
    $transactionDate = isset($_GET['JsonTransactionDate']) ? $_GET['JsonTransactionDate'] : '';
    $paymentMode = isset($_GET['JsonPaymentMode']) ? $_GET['JsonPaymentMode'] : '';
    $chequeNumber = isset($_GET['JsonChequeNumber']) ? $_GET['JsonChequeNumber'] : '';
    $chequeDate = isset($_GET['JsonChequeDate']) ? $_GET['JsonChequeDate'] : '';
    $rateWiseOrderNumber = isset($_GET['JsonRateWiseOrderNumber']) ? $_GET['JsonRateWiseOrderNumber'] : '';
    $clientName = isset($_GET['JsonClientName']) ? $_GET['JsonClientName'] : '';

    // Set default values for optional parameters
    $validStatus = 'Valid';
    $PEXtds = isset($_GET['PEXtds']) ? $_GET['PEXtds'] : 0;
    $PEXbadebt = isset($_GET['PEXbadebt']) ? $_GET['PEXbadebt'] : 0;
    $OPEXtds = isset($_GET['OPEXtds']) ? $_GET['OPEXtds'] : 0;
    $OPEXbadebt = isset($_GET['OPEXbadebt']) ? $_GET['OPEXbadebt'] : 0;
    $CAPEXtds = isset($_GET['CAPEXtds']) ? $_GET['CAPEXtds'] : 0;
    $CAPEXbadebt = isset($_GET['CAPEXbadebt']) ? $_GET['CAPEXbadebt'] : 0;

    // Get the latest FinanceId from the table
    $stmt = $pdo->prepare("SELECT MAX(ID) AS maxFinanceId FROM financial_transaction_table;");
    $stmt->execute();
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    $newFinanceId = isset($result['maxFinanceId']) ? $result['maxFinanceId'] + 1 : 1;

   // Create the SearchTerm
    // Trim each part and ensure no extra spaces are added
$SearchConcat = trim($newFinanceId) 
              . ($orderAmount !== '' ? " - ₹" . trim($orderAmount) : '') 
              . ($clientName !== '' ? " - " . trim($clientName) : '')
              . ($transactionType !== '' ? " - " . trim($transactionType) : '')
              . ($orderNumber !== '' ? " - " . trim($orderNumber) : '')
              . ($rateWiseOrderNumber !== '' ? " - " . trim($rateWiseOrderNumber) : '')
              . ($paymentMode !== '' ? " - " . trim($paymentMode) : '');

// Ensure the entire string is trimmed after concatenation
$SearchTerm = trim($SearchConcat);
    // MP-73-Fix saving issue for GS(PHP & DB)
    // if ($dbName == 'Grace Scans') {
    //     // Prepare SQL statement for 'Grace Scans'
    //     $stmt = $pdo->prepare("INSERT INTO financial_transaction_table
    //         (ID, EntryUser, TransactionType, OrderNumber, Remarks, ExpensesCategory, Amount, TaxType, 
    //         TaxAmount, PaymentMode, ChequeNumber, ChequeDate, ValidStatus, TransactionDate, 
    //         RateWiseOrderNumber, SearchTerm) 
    //         VALUES(:financeIdPDO, :entryUserPDO, :transactionTypePDO, :orderNumberPDO, :remarksPDO, :expenseCategoryPDO, 
    //         :amountPDO, :taxTypePDO, :taxAmountPDO, :paymentModePDO, :chequeNumberPDO, :chequeDatePDO, 
    //         :validStatusPDO, :transactionDatePDO, :rateWiseOrderNumberPDO, :SearchTermPDO)");

    //     // Bind parameters
    //     $stmt->bindParam(":financeIdPDO", $newFinanceId);
    //     $stmt->bindParam(":entryUserPDO", $username);
    //     $stmt->bindParam(":transactionTypePDO", $transactionType);
    //     $stmt->bindParam(":orderNumberPDO", $orderNumber);
    //     $stmt->bindParam(":remarksPDO", $remarks);
    //     $stmt->bindParam(":expenseCategoryPDO", $expenseCategory);
    //     $stmt->bindParam(":amountPDO", $orderAmount);
    //     $stmt->bindParam(":taxTypePDO", $taxType);
    //     $stmt->bindParam(":taxAmountPDO", $gstAmount);
    //     $stmt->bindParam(":paymentModePDO", $paymentMode);
    //     $stmt->bindParam(":chequeNumberPDO", $chequeNumber);
    //     $stmt->bindParam(":chequeDatePDO", $chequeDate);
    //     $stmt->bindParam(":validStatusPDO", $validStatus);
    //     $stmt->bindParam(":transactionDatePDO", $transactionDate);
    //     $stmt->bindParam(":rateWiseOrderNumberPDO", $rateWiseOrderNumber);
    //     $stmt->bindParam(":SearchTermPDO", $SearchTerm);
    //     $stmt->execute();
    // } else {
        // MP-76-Fix saving issue for BM.(PHP & DB)

        // Fetch the latest ledgerBalance
        // Fetch the latest ledger balance
$stmt = $pdo->prepare("SELECT ledgerBalance FROM financial_transaction_table WHERE ValidStatus = 'Valid' ORDER BY ID DESC LIMIT 1;");
$stmt->execute();
$result = $stmt->fetch(PDO::FETCH_ASSOC);
$latestLedgerBalance = !empty($result['ledgerBalance']) ? $result['ledgerBalance'] : 0;

// Validate and normalize transaction type
$transactionType = strtolower(trim($transactionType));
if (!is_numeric($orderAmount) || $orderAmount < 0) {
    throw new Exception("Invalid order amount");
}

// Calculate the new ledger balance
$newLedgerBalance = $latestLedgerBalance;
if ($transactionType === 'income') {
    $newLedgerBalance += $orderAmount;  // Add income to the latest ledger balance
} elseif (strpos($transactionType, 'expense') !== false) {
    $newLedgerBalance -= $orderAmount;  // Subtract expense from the latest ledger balance
} else {
    throw new Exception("Invalid transaction type");
}

// Debugging
error_log("Latest Ledger Balance: $latestLedgerBalance");
error_log("Transaction Type: $transactionType");
error_log("Order Amount: $orderAmount");
error_log("New Ledger Balance: $newLedgerBalance");


        // Prepare SQL statement for other DBs
        $stmt = $pdo->prepare("INSERT INTO financial_transaction_table
            (ID, EntryUser, TransactionType, OrderNumber, Remarks, ExpensesCategory, Amount, TaxType, 
            TaxAmount, PaymentMode, ChequeNumber, ChequeDate, ValidStatus, PEXtds, PEXbadebt, 
            OPEXtds, OPEXbadebt, CAPEXtds, CAPEXbadebt, TransactionDate, RateWiseOrderNumber, LedgerBalance, 
            SearchTerm) 
            VALUES(:financeIdPDO, :entryUserPDO, :transactionTypePDO, :orderNumberPDO, :remarksPDO, :expenseCategoryPDO, 
            :amountPDO, :taxTypePDO, :taxAmountPDO, :paymentModePDO, :chequeNumberPDO, :chequeDatePDO, 
            :validStatusPDO, :PEXtdsPDO, :PEXbadebtPDO, :OPEXtdsPDO, :OPEXbadebtPDO, :CAPEXtdsPDO, 
            :CAPEXbadebtPDO, :transactionDatePDO, :rateWiseOrderNumberPDO, :ledgerBalancePDO, :SearchTermPDO)");

        // Bind parameters
        $stmt->bindParam(":financeIdPDO", $newFinanceId);
        $stmt->bindParam(":entryUserPDO", $username);
        $stmt->bindParam(":transactionTypePDO", $transactionType);
        $stmt->bindParam(":orderNumberPDO", $orderNumber);
        $stmt->bindParam(":remarksPDO", $remarks);
        $stmt->bindParam(":expenseCategoryPDO", $expenseCategory);
        $stmt->bindParam(":amountPDO", $orderAmount);
        $stmt->bindParam(":taxTypePDO", $taxType);
        $stmt->bindParam(":taxAmountPDO", $gstAmount);
        $stmt->bindParam(":paymentModePDO", $paymentMode);
        $stmt->bindParam(":chequeNumberPDO", $chequeNumber);
        $stmt->bindParam(":chequeDatePDO", $chequeDate);
        $stmt->bindParam(":validStatusPDO", $validStatus);
        $stmt->bindParam(":PEXtdsPDO", $PEXtds);
        $stmt->bindParam(":PEXbadebtPDO", $PEXbadebt);
        $stmt->bindParam(":OPEXtdsPDO", $OPEXtds);
        $stmt->bindParam(":OPEXbadebtPDO", $OPEXbadebt);
        $stmt->bindParam(":CAPEXtdsPDO", $CAPEXtds);
        $stmt->bindParam(":CAPEXbadebtPDO", $CAPEXbadebt);
        $stmt->bindParam(":transactionDatePDO", $transactionDate);
        $stmt->bindParam(":rateWiseOrderNumberPDO", $rateWiseOrderNumber);
        $stmt->bindParam(":ledgerBalancePDO", $newLedgerBalance);
        $stmt->bindParam(":SearchTermPDO", $SearchTerm);
        $stmt->execute();
    // }

    echo json_encode("Inserted Successfully!");
	} catch(PDOException $e) {
    	echo json_encode("Error inserting data: ".$e->getMessage());
}
?>