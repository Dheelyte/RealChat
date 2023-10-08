// axiosInstance.js
import axios from 'axios';

const Api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/', // Your base URL here
  // You can also set other default configurations here, like headers
});

export default Api;
