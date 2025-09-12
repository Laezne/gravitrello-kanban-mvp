import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export const fetchData = async (url, method = 'GET', data = null) => {
  try {
    const config = {
      method,
      url,
      ...(data && { data }),
    };
    
    const response = await api(config);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export default api;