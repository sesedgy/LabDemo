import axios from 'axios';
import { API_CONFIG } from '../../constants';

const instance = axios.create({
  baseURL: `${API_CONFIG.protocol}://${API_CONFIG.hostName}`,
  timeout: 10000,
});

export const getPromise = path => instance.get(`/${path}`);

export const postPromise = (path, requestBody) => instance.post(`/${path}`, requestBody);
