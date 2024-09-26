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

export const FetchFinanceSeachTerm = async(DBName, SearchTerm) => {
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

export const FetchConsultantSearchTerm = async(DBName, SearchTerm) => {
    let SearchTerms = [];
    const response = await api.get("SearchConsultant.php/get",{
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
