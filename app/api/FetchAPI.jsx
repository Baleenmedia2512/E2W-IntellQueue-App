import axios from 'axios';

export const api = axios.create({
    baseURL: "https://orders.baleenmedia.com/API/Media/"
})    

export const FetchRateSeachTerm = async(DBName, SearchTerm, showInvalid) => {
    let SearchTerms = [];
    const response = await api.get("SearchRatesTest.php/get",{
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        },
        params:{
            JsonDBName: DBName,
            JsonSearchTerm: SearchTerm,
            InvalidOnly: showInvalid 
        }
    });
    SearchTerms = response.data;
    return SearchTerms;
}

export const FetchFinanceSearchTerm = async(DBName, SearchTerm) => {
    let SearchTerms = [];
    const response = await api.get("SearchFinance.php/get",{
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        },
        params:{
            JsonDBName: DBName,
            JsonSearchTerm: SearchTerm
        }
    });
    SearchTerms = response.data;
    return SearchTerms;
}

export const FetchConsultantSearchTerm = async (DBName, SearchTerm, showInvalid) => {
    let SearchTerms = [];
    const response = await api.get("SearchConsultant.php/get", {
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        },
        params: {
            JsonDBName: DBName,
            JsonSearchTerm: SearchTerm,
            InvalidOnly: showInvalid 
        }
    });
    SearchTerms = response.data;
    return SearchTerms;
}



export const FetchOrderSeachTerm = async(DBName, SearchTerm) => {
    let SearchTerms = [];
    try{
        const response = await api.get("SearchOrder.php/get",{
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            params:{
                JsonDBName: DBName,
                JsonSearchTerm: SearchTerm
            }
        });
        SearchTerms = response.data;
    }catch(error){
        console.error(error)
    }
    
    return SearchTerms;
}


export const FetchQuoteSearchTerm = async(DBName, SearchTerm) => {
    let SearchTerms = [];
    try{
        const response = await api.get("SearchQuote.php/get",{
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            params:{
                JsonDBName: DBName,
                JsonSearchTerm: SearchTerm
            }
        });
        SearchTerms = response.data;
    }catch(error){
        console.error(error)
    }
    
    return SearchTerms;
}

export const UpdatePaymentMilestone = async(Stages, DBName) => {
    let result = "";
    try {
        // Post request without FormData wrapper
        const response = await api.post("RemoveAllPaymentMilestone.php", {
            JsonDBName: DBName,
            JsonStages: Stages,
            JsonOrderNumber:OrderNumber,
            JsonUser: loggedInUser
        }, {
            headers: {
                'Content-Type': "application/json"
            }
        });

        result = response.data; // Return the entire response data instead of just 'success'
    } catch (error) {
        console.error(error);

        // Check if error contains response data
        if (error.response && error.response.data) {
            result = `Error: ${error.response.data.error}`;
        } else {
            result = `Error while updating stage: ${error.message}`;
        }
    }

    return result; // Return full result object
};

export const FetchQuoteData = async(DBName, QuoteId) => {
    let result = [];
    try{
        const response = await api.get("FetchQuoteData.php/?",{
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            params: {
                JsonDBName: DBName,
                JsonQuoteId: QuoteId
            }
        }); 
        result = response.data;

    }catch(error){
        console.error(error);
    }

    return result;
}