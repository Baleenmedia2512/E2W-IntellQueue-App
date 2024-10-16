import axios from 'axios';

const api = axios.create({
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