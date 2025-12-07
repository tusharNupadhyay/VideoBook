import config from '../config/config';
import axios from 'axios';

const api = axios.create({
  baseURL: config.baseUrl,
  withCredentials: true, //When React makes requests, the browser does not send cookies by default, with this axios tells the browser to sends and receive cookies so that user won't get logged out after refresh
});

export default api;
