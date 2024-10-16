import axios from 'axios';

const api = axios.create({
    baseURL: "https://orders.baleenmedia.com/API/Hospital-Form/"
})

export const FetchSeachTerm = async(SearchTerm) => {
    let SearchTerms = [];
    try{
        const response = await api.get("Search.php",{
            headers: {
                'Content-Type': 'application/json'
            },
            params:{
                JsonSearchTerm: SearchTerm
            }
        });
        SearchTerms = response.data;
    } catch (error){
        alert("Failed to Fetch Data");
    }
    return SearchTerms;
}