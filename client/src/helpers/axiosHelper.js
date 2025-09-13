import axios from "axios";

//variables de entorno de vite
const apiUrl = import.meta.env.VITE_SERVER_URL_API;

//función para realizar peticiones al back
export const fetchData = async (url, method, data = null, token = null) => {
  let headers = {};
  if (token) {
    headers = { Authorization: `Bearer ${token}` };
  }

  const config = {
    method,
    url: apiUrl + url,
    headers,
    data,
    withCredentials: true, // 🔑 esto hace que el navegador mande la cookie al backend
  };

  const response = await axios(config);

  return response;
};
