// Configuration for API endpoints
export const API_BASE_URL = 'http://localhost/easy2work-backend/API/Media';
export const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET;

// Common API URLs
export const getApiUrl = (endpoint) => `${API_BASE_URL}/${endpoint}`;

// API helper function with encryption
export const constructApiUrl = (endpoint, queryParams = {}, useEncryption = false) => {
    const url = getApiUrl(endpoint);
    const params = new URLSearchParams(queryParams);
    
    if (useEncryption) {
        // Add encryption token or headers as needed
        params.append('token', ENCRYPTION_SECRET);
    }
    
    return `${url}${queryParams ? '?' + params.toString() : ''}`;
};

// List of all API endpoints used in the application
export const API_ENDPOINTS = {
    // Client Management
    FETCH_CLIENT_DETAILS: 'FetchClientDetails.php',
    FETCH_CLIENT_BY_CONTACT: 'FetchClientDetailsByContact.php',
    INSERT_NEW_CLIENT: 'InsertNewEnquiry.php',
    UPDATE_CLIENT: 'UpdateClientDetails.php',
    REMOVE_CLIENT: 'RemoveClient.php',

    // Rate Management
    FETCH_RATES: 'FetchRates.php',
    FETCH_VALID_RATES: 'FetchValidRates.php',
    ADD_NEW_RATES: 'AddNewRates.php',
    UPDATE_RATES: 'UpdateRates.php',
    DELETE_RATES: 'DeleteRates.php',
    RESTORE_RATES: 'RestoreRates.php',
    
    // Order Management
    CREATE_NEW_ORDER: 'CreateNewOrder.php',
    UPDATE_ORDER: 'UpdateNewOrder.php',
    FETCH_ORDER_DETAILS: 'FetchOrderDetails.php',
    
    // Finance Management
    FINANCE_LIST: 'FinanceList.php',
    ADD_FINANCE_ENTRY: 'AddNewFinanceEntry.php',
    DELETE_TRANSACTION: 'DeleteTransaction.php',
    
    // Quote Management
    FETCH_QUOTE_ITEMS: 'FetchQuoteItems.php',
    ADD_QUOTE: 'AddItemToCartAndQuote.php',
    UPDATE_QUOTE: 'UpdateQuotesData.php',
    
    // Units and Parameters
    FETCH_UNITS: 'FetchUnits.php',
    FETCH_CAMPAIGN_UNITS: 'FetchCampaignUnits.php',
    FETCH_QTY_SLAB: 'FetchQtySlab.php',
    
    // Search and Suggestions
    SEARCH_RATES: 'SearchRatesTest.php',
    SEARCH_FINANCE: 'SearchFinance.php',
    SEARCH_CONSULTANT: 'SearchConsultant.php',
    SEARCH_ORDER: 'SearchOrder.php',
    SEARCH_QUOTE: 'SearchQuote.php',
    
    // Commission and TnC
    FETCH_COMMISSION: 'FetchCommissionData.php',
    GET_TNC: 'GetTnC.php'
};
