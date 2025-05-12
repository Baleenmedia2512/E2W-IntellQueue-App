import axios from "axios";

export const GetCRUD = async (endpoint, queryParams = {}) => {
  try {
      const response = await axios.get(endpoint, {
          params: queryParams,
          timeout: 10000
      });
      return { data: response.data, error: null };
  } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data
          ? `Error: ${JSON.stringify(error.response.data)}`
          : `Error while fetching data: ${error.message}`;
      return { data: null, error: errorMsg };
  }
}