import * as axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? '/api/': 'http://localhost:8080/api/',
  timeout: 30000
});