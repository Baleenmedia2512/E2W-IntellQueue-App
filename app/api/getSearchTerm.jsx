import axios from 'axios';

const api = axios.create({
    baseURL: "https://orders.baleenmedia.com/API/Hospital-Form/"
})

export const FetchSearchTerm = async(DBName, SearchTerm) => {
    let SearchTerms = [];
    try{
        const response = await api.get("Search.php",{
            headers: {
                'Content-Type': 'application/json'
            },
            params:{
                JsonDBName: DBName,
                JsonSearchTerm: SearchTerm
            }
        });
        SearchTerms = response.data;
    } catch (error){
        alert("Failed to search existing client data.");
    }
    return SearchTerms;
}

export const FetchExistingAppointments = async(DBName, SearchTerm) => {
    let SearchTerms = [];
    try {
        const response = await api.get("SearchAppointments.php",{
            headers: {
                'Content-Type' : 'application/json'
            },
            params:{
                JsonDBName: DBName,
                JsonSearchTerm: SearchTerm
            }
        });
        SearchTerms = response.data;
    } catch (error) {
        alert("Failed to search existing appointments.");
    }
    return SearchTerms;
}