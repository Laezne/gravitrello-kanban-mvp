import axios from "axios";

//variables de entorno de vite
const apiUrl = import.meta.env.VITE_SERVER_URL_API;

//función para realizar peticiones al back
export const fetchData = async (url, method, data = null, token = null) => {
  let headers = {};
  if (token) {
    headers = { Authorization: `Bearer ${token}` };
  }

  // 🔑 Si es FormData, no establecer Content-Type (axios lo hará automáticamente)
  // Si es JSON, establecer Content-Type
  if (data && !(data instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
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