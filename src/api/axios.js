import axios from "axios";
import { getToken } from "../utils/tokenHelper";
import { API_BASE_URL } from "../utils/constants";
import { jwtDecode } from "jwt-decode"

// Create an Axios instance
const instance = axios.create({
  baseURL: API_BASE_URL,
});

// Helper: check if token is expired
const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    const now = Math.floor(Date.now() / 1000); // seconds
    return decoded.exp < now;
  } catch {
    return false;
  }
};

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const token = getToken();

    if (status === 401 && token && isTokenExpired(token)) {
      window.dispatchEvent(new Event("unauthorized"));
    }

    return Promise.reject(error);
  }
);

export default instance;




// import axios from 'axios';

// export default axios.create({
//   baseURL: 'http://localhost:5126/api/',
// });
