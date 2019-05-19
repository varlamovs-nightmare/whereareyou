import * as axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NODE_ENV === 'production' ? '/api/': '/api/',
  timeout: 60000
});