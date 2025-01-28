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

export const FetchQtySlab = async(DBName, RateId) => {
    let QtySlab = [];
    try {
        const response = await api.get("FetchQtySlab.php/get",{
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            params:{
                JsonDBName: DBName,
                JsonRateId: RateId
            }
        });
        QtySlab = response.data;
    } catch (error) {
        alert("Error while fetching Qty Slab: " + error);
    }

    return QtySlab;
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

    return result;
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

        result = response.data; // Return the entire response data instead of just 'success'
    } catch (error) {
        console.error(error);
    }

    return result;
};

export const FetchCommissionData = async(DBName, ConsultantName, rateName, rateType) => {
    let result = [];
    try{
        const response = await api.get("FetchCommissionData.php/?",{
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            params: {
                JsonDBName: DBName,
                JsonConsultantName: ConsultantName,
                JsonRateName: rateName,
                JsonRateType: rateType
            }
        }); 
        result = response.data.Commission;

    }catch(error){
        console.error(error);
    }

    return result;
};

export const getTnC = async(CompanyName) => {
    const response = await fetch(`https://orders.baleenmedia.com/API/Media/GetTnC.php/?JsonDBName=${CompanyName}`);
    const TnC = response.json();
    return TnC;
}

export const fetchQuoteClientData = async(clientID, DBName) => {
    let ClientData = [];
    try{
        const response = await api.get("FetchClientDetails.php/get",{
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            params:{
                JsonDBName: DBName,
                ClientID: clientID
            }
        });
        ClientData = response.data;
    }catch(error){
        console.error(error)
    }
    
    return ClientData;
}

export const ClientSearchSuggestions = async(ClientName, DBName, SearchType) => {
    let ClientData = [];
    try{
        const response = await api.get("SuggestingClientNames.php/get",{
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            params:{
                suggestion: ClientName,
                JsonDBName: DBName,
                type: SearchType
            }
        });
        ClientData = response.data;
    }catch(error){
        console.error(error)
    }
    
    return ClientData;
}

export const elementsToHideList = async(DBName) => {
    let result = [];
    try{
        const response = await api.get("FetchNotVisibleElementName.php/get",{
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            params:{
                JsonDBName: DBName
            }
        });
        result = response.data;
        return result
    } catch(error){
      console.error("Error showing element names: " + error)
    }
  }

  export const FetchSpecificRateData = async(DBName, RateId) => {
    let rates = [];
    try {
        const response = await api.get("FetchGivenRate.php/get",{
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            params:{
                JsonDBName: DBName,
                JsonRateId: RateId
            }
        });
        rates = response.data;
    } catch (error) {
        alert("Error while Searching Rate!");
    }
    
    return rates;
  }

  export const FetchAllValidRates = async(DBName) => {
    let rates = [];

    try {
        const response = await api.get("FetchValidRates.php/get",{
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            params:{
                JsonDBName: DBName
            }
        });

        rates = response.data;
    } catch (error) {
        alert("Unable to Fetch Rates!")
    }

    return rates;
  }

  export const FetchQuoteRemarks = async(value) => {
    let suggestions = [];

    try {
        const response = await api.get("SuggestingRemarks.php/get",{
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            params:{
                suggestion: value
            }
        });

        suggestions = response.data;
    } catch (error) {
        alert("Unable to Fetch Rates!")
    }

    return suggestions;
  }

  export const FetchActiveCSE = async(DBName) => {
    let CSE = [];

    try {
        const response = await api.get("FetchActiveCSEs.php/get",{
            headers:{
                'Content-Type': 'application/json; charset=utf-8'
            },
            params:{
                JsonDBName: DBName
            }
        })

        CSE = response.data;
    } catch (error) {
        alert("Unable to Fetch CSE Name")
    }

    return CSE;
  }
 
  export const FetchExistingLeads = async(DBName, SearchTerm) => {
    let LeadData = [];

    try {
        const response = await api.get("FetchExistingLeads.php/get",{
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            params:{
                JsonDBName: DBName,
                JsonSearchTerm: SearchTerm
            }
        });
         LeadData = response.data;
    } catch (error) {
        alert("Unable to Fetch Existing Leads Data")
    }

    return LeadData;
  }

  export const FetchTDSPercentage = async(DBName, OrderNumber) => {
    let TDS = [];

    try {
        const response = await api.get("FetchExistingLeads.php/get",{
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            params:{
                JsonDBName: DBName,
                orderNumber: OrderNumber
            }
        });
        TDS = response.data;
    } catch (error) {
        alert("Unable to Fetch Existing Leads Data")
    }

    return TDS;
  }