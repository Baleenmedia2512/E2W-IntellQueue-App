<?php
require 'ConnectionManager.php';

$dbName = isset($_GET['JsonDBName']) ? $_GET['JsonDBName'] : 'Baleen Test';
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

try {
    ConnectionManager::connect($dbName);
    $pdo = ConnectionManager::getConnection();

    // Retrieve the parameters from the request
    $FinanceId = isset($_GET['JsonFinanceId']) ? $_GET['JsonFinanceId'] : '';
    $EntryUser = isset($_GET['JsonUserName']) ? $_GET['JsonUserName'] : '';
    $Amount = isset($_GET['JsonAmount']) ? (float) $_GET['JsonAmount'] : 0.0;
    $Remarks = isset($_GET['JsonRemarks']) ? $_GET['JsonRemarks'] : '';
    $TaxType = isset($_GET['JsonTaxType']) ? $_GET['JsonTaxType'] : '';
    $TransactionDate = isset($_GET['JsonTransactionDate']) ? $_GET['JsonTransactionDate'] : date('Y-m-d');
    $PaymentMode = isset($_GET['JsonPaymentMode']) ? $_GET['JsonPaymentMode'] : '';
    $TransactionType = isset($_GET['JsonTransactionType']) ? $_GET['JsonTransactionType'] : '';
    $ExpenseCategory = isset($_GET['JsonExpenseCategory']) ? $_GET['JsonExpenseCategory'] : '';
    $ChequeDate = isset($_GET['JsonChequeDate']) ? $_GET['JsonChequeDate'] : null;
    $EntryDate = date('Y-m-d H:i:s');
    $OrderNumber = isset($_GET['JsonOrderNumber']) ? $_GET['JsonOrderNumber'] : '';
    $RateWiseOrderNumber = isset($_GET['JsonRateWiseOrderNumber']) ? $_GET['JsonRateWiseOrderNumber'] : '';
    $clientName = isset($_GET['JsonClentName']) ? $_GET['JsonClentName'] : '';
    $ChequeNumber = isset($_GET['JsonChequeNumber']) ? $_GET['JsonChequeNumber'] : null;

    // Create the SearchTerm
    $SearchTerm = trim($FinanceId) 
              . ($Amount !== '' ? " - ₹" . trim($Amount) : '') 
              . ($clientName !== '' ? " - " . trim($clientName) : '')
              . ($TransactionType !== '' ? " - " . trim($TransactionType) : '')
              . ($OrderNumber !== '' ? " - " . trim($OrderNumber) : '')
              . ($RateWiseOrderNumber !== '' ? " - " . trim($RateWiseOrderNumber) : '')
              . ($PaymentMode !== '' ? " - " . trim($PaymentMode) : '');

    $SearchTerm = trim($SearchTerm);

    // Get the previous ledger balance
    $stmt = $pdo->prepare("
        SELECT ledgerBalance 
        FROM financial_transaction_table 
        WHERE id < :PDOFinanceId 
          AND ValidStatus = 'valid'
        ORDER BY id DESC 
        LIMIT 1
    ");
    $stmt->bindParam(':PDOFinanceId', $FinanceId, PDO::PARAM_INT);
    $stmt->execute();
    $previousLedgerBalance = $stmt->fetchColumn();

    // Default to 0 if no previous balance is found
    if ($previousLedgerBalance === false) {
        $previousLedgerBalance = 0.0;
    }

    // Calculate the new ledger balance for the current row
    $newLedgerBalance = $previousLedgerBalance;
    if (strtolower($TransactionType) === 'income') {
        $newLedgerBalance += $Amount;
    } elseif (strpos(strtolower($TransactionType), 'expense') !== false) {
        $newLedgerBalance -= $Amount;
    }

    // Update the current record
    $stmt = $pdo->prepare("
        UPDATE financial_transaction_table SET 
            EntryUser = :PDOEntryUser,
            Amount = :PDOAmount,
            Remarks = :PDORemarks,
            TaxType = :PDOTaxType,
            TransactionDate = :PDOTransactionDate,
            PaymentMode = :PDOPaymentMode,
            TransactionType = :PDOTransactionType,
            ExpensesCategory = :PDOExpenseCategory,
            ChequeDate = :PDOChequeDate, 
            ChequeNumber = :PDOChequeNumber,
            EntryDate = :PDOEntryDate,
            SearchTerm = :PDOSearchTerm,
            LedgerBalance = :PDOLedgerBalance
        WHERE ID = :PDOFinanceId
    ");
    $stmt->bindParam(':PDOEntryUser', $EntryUser);
    $stmt->bindParam(':PDOFinanceId', $FinanceId);
    $stmt->bindParam(':PDOAmount', $Amount);
    $stmt->bindParam(':PDORemarks', $Remarks);
    $stmt->bindParam(':PDOTaxType', $TaxType);
    $stmt->bindParam(':PDOTransactionDate', $TransactionDate);
    $stmt->bindParam(':PDOPaymentMode', $PaymentMode);
    $stmt->bindParam(':PDOTransactionType', $TransactionType);
    $stmt->bindParam(':PDOExpenseCategory', $ExpenseCategory);
    $stmt->bindParam(':PDOChequeDate', $ChequeDate);
    $stmt->bindParam(':PDOChequeNumber', $ChequeNumber);
    $stmt->bindParam(':PDOEntryDate', $EntryDate);
    $stmt->bindParam(':PDOSearchTerm', $SearchTerm);
    $stmt->bindParam(':PDOLedgerBalance', $newLedgerBalance);

    $stmt->execute();

    // Update subsequent ledger balances
    $stmt = $pdo->prepare("
        UPDATE financial_transaction_table ft
        JOIN (
            SELECT t1.id, 
                   (@ledgerBalance := CASE
                       WHEN t1.TransactionType = 'income' THEN @ledgerBalance + t1.amount
                       WHEN t1.TransactionType LIKE '%expense%' THEN @ledgerBalance - t1.amount
                       ELSE @ledgerBalance
                   END) AS new_ledger_balance
            FROM financial_transaction_table t1
            CROSS JOIN (SELECT @ledgerBalance := :PDOInitialLedgerBalance) params
            WHERE t1.id > :PDOFinanceId
              AND t1.ValidStatus = 'valid'
            ORDER BY t1.id
        ) t2 ON ft.id = t2.id
        SET ft.ledgerBalance = t2.new_ledger_balance
    ");
    $stmt->bindParam(':PDOInitialLedgerBalance', $newLedgerBalance, PDO::PARAM_STR);
    $stmt->bindParam(':PDOFinanceId', $FinanceId, PDO::PARAM_INT);
    $stmt->execute();

    echo json_encode("Values Updated Successfully!");
} catch(PDOException $e) {
    echo json_encode("Error Updating Data: " . $e->getMessage());
}
?>
