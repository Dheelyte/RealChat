// axiosInstance.js
import axios from 'axios';

const Api = axios.create({
  baseURL: 'http://4.210.216.208:8000/api/', // Your base URL here
  // You can also set other default configurations here, like headers
});

export default Api;
