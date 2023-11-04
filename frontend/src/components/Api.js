import axios from 'axios';

const Api = axios.create({
  baseURL: 'https://reelchat.me/api/',
});

export default Api;
