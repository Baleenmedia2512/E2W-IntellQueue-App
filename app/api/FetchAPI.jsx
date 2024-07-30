import axios from 'axios';

const api = axios.create({
    baseURL: "https://orders.baleenmedia.com/API/Media/"
})

export const FetchRateSeachTerm = async(DBName, SearchTerm) => {
    let SearchTerms = [];
    const response = await api.get("SearchRates.php/get",{
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