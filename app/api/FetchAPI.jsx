import axios from 'axios';

export const api = axios.create({
    baseURL: "https://orders.baleenmedia.com/API/Media/"
})    

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

export const FetchQueueClientData = async (DBName, phoneNumber) => {
    try {
        const response = await api.get("FetchQueueClientData.php", {
            headers: { "Content-Type": "application/json" },
            params: { JsonDBName: DBName, JsonClientContact: phoneNumber }
        });

        const { position, totalOrders, estimatedTime, remainingTime, status } = response.data;
        return { position, total: totalOrders, estimatedTime, remainingTime, status };
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

export const FetchQueueDashboardData = async (DBName) => {
    try {
        const response = await api.get("FetchQueueDashboardData.php", {
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            params: { JsonDBName: DBName }
        });
        // API returns { success: true, data: [...] }
        if (response.data && response.data.success) {
            return response.data.data;
        } else {
            throw new Error(response.data?.message || 'Failed to fetch queue dashboard data');
        }
    } catch (error) {
        console.error("Error fetching queue dashboard data:", error);
        throw error;
    }
};

export const UpdateQueueOrder = async (DBName, rateCard, queueOrder) => {
    const response = await api.post("UpdateQueueOrder.php", {
        JsonDBName: DBName,
        JsonRateCard: rateCard,
        JsonQueueOrder: queueOrder
    });
    return response.data;
};

export const QueueDashboardAction = async (DBName, action, params = {}) => {
    const response = await api.post("QueueDashboardAction.php", {
        JsonDBName: DBName,
        JsonAction: action,
        ...params
    });
    return response.data;
};

// Save a snapshot
export const SaveQueueSnapshot = async (DBName, rateCard, snapshot) => {
    return await api.post("SaveQueueSnapshot.php", {
        JsonDBName: DBName,
        JsonRateCard: rateCard,
        JsonSnapshot: snapshot
    });
};

// Get previous/next snapshot
export const GetQueueSnapshot = async (DBName, rateCard, direction, currentId) => {
    return await api.post("GetQueueSnapshot.php", {
        JsonDBName: DBName,
        JsonRateCard: rateCard,
        direction,
        currentId
    });
};

// Restore a snapshot
export const RestoreQueueSnapshot = async (DBName, rateCard, snapshot) => {
    return await api.post("RestoreQueueSnapshot.php", {
        JsonDBName: DBName,
        JsonRateCard: rateCard,
        JsonSnapshot: snapshot
    });
};

export const AddRemoteQueueUser = async (DBName, ClientContact, RateCard) => {
    try {
        const response = await api.post(
            "AddRemoteQueueUser.php",
            {
                JsonDBName: DBName,
                JsonClientContact: ClientContact,
                JsonRateCard: RateCard, // Ensure RateCard is defined in your context
            },
            {
                headers: {
                    "Content-Type": "application/json",  // Set content type to JSON
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error checking and registering queue:", error);
        if (error.response) {
            console.error("Server response:", error.response.data);
        }
        throw error;
    }
};

export const SaveFcmToken = async (DBName, Token) => {
    try {
        const response = await api.post(
            "SaveFcmToken.php",
            {
                JsonDBName: DBName,
                JsonToken: Token,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error checking and registering queue:", error);
        if (error.response) {
            console.error("Server response:", error.response.data);
        }
        throw error;
    }
};

export const fetchFcmTokens = async (DBName) => {
  try {
    const response = await api.post(
      "FetchFcmToken.php",
      { JsonDBName: DBName },
      { headers: { "Content-Type": "application/json" } }
    );

    if (response.data && response.data.success) {
      return response.data.tokens; // Array of tokens
    } else {
      console.error("Fetch tokens failed:", response.data.message);
      return [];
    }
  } catch (error) {
    console.error("Error fetching tokens:", error);
    return [];
  }
};

export const SaveQueueClientFcmToken = async (DBName, PhoneNumber, Token) => {
    try {
        const response = await api.post(
            "SaveQueueClientFcmToken.php",
            {
                JsonDBName: DBName,
                JsonPhoneNumber: PhoneNumber,
                JsonToken: Token,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error checking and registering queue:", error);
        if (error.response) {
            console.error("Server response:", error.response.data);
        }
        throw error;
    }
};