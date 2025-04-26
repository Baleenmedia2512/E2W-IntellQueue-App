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
        result = response.data.Commission || 0;

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

  export const FetchExistingLeads = async (DBName, SearchTerm) => {
    let LeadData = [];
  
    try {
      const response = await api.get("FetchExistingLeadsTest.php/get", {
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        params: {
          JsonDBName: DBName,
          JsonSearchTerm: SearchTerm
        }
      });
      LeadData = response.data;
      
      // Sort based on DateOfLastRelease in descending order
      LeadData.sort((a, b) => new Date(b.DateOfLastRelease) - new Date(a.DateOfLastRelease));
    } catch (error) {
      alert("Unable to Fetch Existing Leads Data");
    }
  
    return LeadData;
  };

  export const FetchLeadsData = async (DBName, SearchTerm) => {
    let LeadData = [];
    try {
      const response = await api.get("FetchLeadsData.php/get", {
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        params: {
          JsonDBName: DBName,
          JsonSearchTerm: SearchTerm
        }
      });
      LeadData = response.data;
  
      // Get today's date string in "YYYY-MM-DD" format
      const today = new Date().toISOString().slice(0, 10);
  
      LeadData.sort((a, b) => {
        // Check if each lead's NextFollowupDate (if available) equals today
        const aHasToday = a.NextFollowupDate && a.NextFollowupDate.slice(0, 10) === today;
        const bHasToday = b.NextFollowupDate && b.NextFollowupDate.slice(0, 10) === today;
  
        // If one lead's NextFollowupDate is today and the other is not, push the one with today's date on top.
        if (aHasToday && !bHasToday) return -1;
        if (!aHasToday && bHasToday) return 1;
  
        // For both leads (or neither) with NextFollowupDate today,
        // sort descending based on CallFollowupDate.
        // (Make sure that CallFollowupDate exists and is a valid date string)
        const aCall = a.CallFollowupDate ? new Date(a.CallFollowupDate) : 0;
        const bCall = b.CallFollowupDate ? new Date(b.CallFollowupDate) : 0;
        return bCall - aCall;
      });
    } catch (error) {
      console.error(error);
    }
    return LeadData;
  };
  

  export const FetchTDSPercentage = async(DBName, OrderNumber) => {
    let TDS = [];

    try {
        const response = await api.get("FetchTDSByOrderNumber.php/get",{
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            params:{
                JsonDBName: DBName,
                orderNumber: OrderNumber
            }
        });
        TDS = response.data.tdsApplicabilityPercentage;
    } catch (error) {
        alert("Unable to Fetch Existing Leads Data")
    }

    return TDS;
  }

  export const FetchOrderHistory = async(DBName, OrderNumber) => { 
    let OrderHistory = [];

    try {
        const response = await api.get("FetchClientOrderHistory.php/get",{
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            params:{
                JsonDBName: DBName,
                orderNumber: OrderNumber
            }
        });
        OrderHistory = response.data;
    }
    catch (error) {
        alert("Unable to Fetch Order History")
    }

    return OrderHistory;
}

export async function AutoLogin(companyName) {
  try {
    const response = await fetch('https://orders.baleenmedia.com/API/Media/AutoLogin.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ JsonCompanyName: companyName }), // Ensure the key matches the API's expected format
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('AutoLogin API error response:', errorData); // Debugging log
      throw new Error(errorData.error || `API responded with status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in AutoLogin API:', error.message);
    throw error;
  }
}

export const sendOTP = async (DBName, phoneNumber) => {
    try {
        const response = await api.post("SendOTPForQueueApp.php", {
            JsonDBName: DBName,
            JsonClientContact: phoneNumber,
        }, {
            headers: { "Content-Type": "application/json" },
        });
        console.log("OTP sent successfully:", response.data); // Debugging log
        return response.data;
    } catch (error) {
        console.error("Error sending OTP:", error);
        throw error;
    }
};

export const verifyOTP = async (DBName, phoneNumber, otpCode) => {
    try {
        const response = await api.post("VerifyOTPForQueueApp.php", {
            JsonDBName: DBName,
            JsonClientContact: phoneNumber,
            JsonOTP: otpCode,
        }, {
            headers: { "Content-Type": "application/json" },
        });
        return response.data;
    } catch (error) {
        console.error("Error verifying OTP:", error);
        throw error;
    }
};

export const fetchQueueData = async (DBName, phoneNumber) => {
    try {
        const response = await api.get("FetchQueueData.php", {
            headers: { "Content-Type": "application/json" },
            params: { JsonDBName: DBName, JsonClientContact: phoneNumber }
        });

        const { position, totalOrders, estimatedTime, remainingTime } = response.data;
        console.log("Queue data fetched successfully:", response);
        console.log("data sent", DBName, phoneNumber) // Debugging log
        return { position, total: totalOrders, estimatedTime, remainingTime };
    } catch (error) {
        console.error("Error fetching queue data:", error);
        throw error;
    }
};

export const checkAndRegisterQueue = async (DBName, ClientContact, ClientName) => {
    try {
        const response = await api.post("CheckAndRegisterQueue.php", {
            JsonDBName: DBName,
            JsonClientContact: ClientContact,
            JsonClientName: ClientName,
        });

        return response.data;
    } catch (error) {
        console.error("Error checking and registering queue:", error);
        throw error;
    }
};
