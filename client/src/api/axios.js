import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// The "Interceptor"
// RUNS before every request. checks if we have a token 
// in local storage and attaches it to the header.
API.interceptors.request.use((req) => {
  if (localStorage.getItem('token')) {
    req.headers.Authorization = `Bearer ${localStorage.getItem('token')}`;
  }
  return req;
});

export default API;