import axios from 'axios';
import { NotificationManager } from 'react-notifications';
import { API_CONFIG, API_PATHS } from '../../constants';
import { cookiesNames, getCookie } from './authService';
import moment from "../components/LabsPage";

const instance = axios.create({
  baseURL: `${API_CONFIG.protocol}://${API_CONFIG.hostName}`,
  timeout: 10000,
});

export const getPromise = path => instance.get(`/${path}`);

export const postPromise = (path, requestBody) => instance.post(`/${path}`, requestBody);

export const getTries = () => new Promise((resolve) => {
  getPromise(API_PATHS.GET.GET_TRIES, { token: getCookie(cookiesNames.token) })
    .then((response) => {
      if (response.error) {
        NotificationManager.error('Error', response.error);
      } else {
        resolve(response.data);
      }
    });
});

export const getServices = () => new Promise((resolve) => {
  getPromise(API_PATHS.GET.GET_SERVICES).then((response) => {
    if (response.error) {
      NotificationManager.error('Error', response.error);
    } else {
      resolve(response.data);
    }
  });
});

export const getFlags = () => new Promise((resolve) => {
  getPromise(API_PATHS.GET.GET_FLAGS).then((response) => {
    if (response.error) {
      NotificationManager.error('Error', response.error);
    } else {
      resolve(response.data);
    }
  });
});

export const getUserId = () => new Promise((resolve) => {
  postPromise(API_PATHS.POST.GET_USERS, { token: getCookie(cookiesNames.token) }).then((response) => {
    if (response.error) {
      NotificationManager.error('Error', response.error);
    } else {
      resolve(response._id);
    }
  });
});

export const createTry = () => new Promise((resolve) => {
  const tryName = moment().format('HH:mm DD.MM.YYYY');
  postPromise(API_PATHS.POST.CREATE_TRY, { token: getCookie(cookiesNames.token), tryName }).then((response) => {
    if (response.error) {
      NotificationManager.error('Error', response.error);
    } else {
      resolve();
    }
  });
});

export const sendFlag = (flagCode) => new Promise((resolve) => {
  postPromise(API_PATHS.POST.CHECK_FLAG, { flagCode }).then((response) => {
    if (response.error) {
      NotificationManager.error('Error', response.error);
    } else {
      NotificationManager.success('Flag is correct', '');
      resolve();
    }
  });
});