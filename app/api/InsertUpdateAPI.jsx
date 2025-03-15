import { api } from "./FetchAPI";

export const PostInsertOrUpdate = async (endpoint, data) => {
    let result = [];
    try {
        const response = await api.post(`${endpoint}.php`, data, {
            headers: {
                "Content-Type": "application/json"
            }
        });

        result = response.data;
    } catch (error) {
        console.error(error);
        
        if (error.response && error.response.data) {
            result = `Error: ${JSON.stringify(error.response.data)}`;
        } else {
            result = `Error while updating stage: ${error.message}`;
        }
    }

    return result;
<<<<<<< HEAD
};
=======
};

export const GetInsertOrUpdate = async (endpoint, queryParams = {}) => {
    let result = [];
    try {
      const response = await api.get(`${endpoint}.php`, {
        params: queryParams
      });
      result = response.data;
    } catch (error) {
      console.error(error);
      if (error.response && error.response.data) {
        result = `Error: ${JSON.stringify(error.response.data)}`;
      } else {
        result = `Error while fetching data: ${error.message}`;
      }
    }
    return result;
  };
  
>>>>>>> 24e2e75fc2d575a15d4fbc0496c033d9b6f5e507
