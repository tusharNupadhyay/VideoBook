import config from "./config"
import axios from 'axios';

// This ensures EVERY request globally sends cookies
axios.defaults.withCredentials = true;
const api = axios.create({
  baseURL: config.baseUrl,
  withCredentials: true, //When React makes requests, the browser does not send cookies by default, with this axios tells the browser to sends and receive cookies so that user won't get logged out after refresh
});

export default api;
