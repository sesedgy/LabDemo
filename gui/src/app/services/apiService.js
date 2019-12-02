import axios from 'axios';
import moment from 'moment';

import { NotificationManager } from 'react-notifications';
import { API_CONFIG, API_PATHS } from '../../constants';
import { cookiesNames, getCookie } from './authService';

const instance = axios.create({
  baseURL: `${API_CONFIG.protocol}://${API_CONFIG.hostName}`,
  timeout: 10000,
});

export const getPromise = path => instance.get(`/${path}`);

export const postPromise = (path, requestBody) => instance.post(`/${path}`, requestBody);

export const getTries = () => new Promise((resolve) => {
  getPromise(API_PATHS.GET.GET_TRIES, { token: getCookie(cookiesNames.token) })
    .then((response) => {
      if (!response.data.error) {
        resolve(response.data);
      }
    }).catch((error) => {
      NotificationManager.error(error.response.data.error);
    });
});

export const getServices = () => new Promise((resolve) => {
  getPromise(API_PATHS.GET.GET_SERVICES).then((response) => {
    if (!response.data.error) {
      resolve(response.data);
    }
  }).catch((error) => {
    NotificationManager.error(error.response.data.error);
  });
});

export const getFlags = () => new Promise((resolve) => {
  getPromise(API_PATHS.GET.GET_FLAGS).then((response) => {
    if (!response.data.error) {
      resolve(response.data);
    }
  }).catch((error) => {
    NotificationManager.error(error.response.data.error);
  });
});

export const getUserId = () => new Promise((resolve) => {
  postPromise(API_PATHS.POST.GET_USER, { token: getCookie(cookiesNames.token) }).then((response) => {
    if (!response.data.error) {
      resolve(response.data._id);
    }
  }).catch((error) => {
    NotificationManager.error(error.response.data.error);
  });
});

export const createTry = () => new Promise((resolve) => {
  const tryName = moment().format('HH:mm DD.MM.YYYY');
  postPromise(API_PATHS.POST.CREATE_TRY, { token: getCookie(cookiesNames.token), tryName }).then((response) => {
    if (!response.data.error) {
      resolve();
    }
  }).catch((error) => {
    NotificationManager.error(error.response.data.error);
  });
});

export const sendFlag = flagCode => new Promise((resolve) => {
  postPromise(API_PATHS.POST.CHECK_FLAG, { flagCode }).then((response) => {
    if (!response.data.error) {
      NotificationManager.success('Flag is correct', '');
      resolve();
    }
  }).catch((error) => {
    NotificationManager.error(error.response.data.error);
  });
});
