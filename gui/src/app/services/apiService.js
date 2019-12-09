import axios from 'axios';
import moment from 'moment';

import { NotificationManager } from 'react-notifications';
import hash from 'object-hash';
import { API_CONFIG, API_PATHS } from '../../constants';
import {
  cookiesNames, deleteCookie, getCookie, setCookie,
} from './authService';

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
      NotificationManager.error(error.response ? error.response.data.error : error.toString());
    });
});

export const getServices = () => new Promise((resolve) => {
  getPromise(API_PATHS.GET.GET_SERVICES).then((response) => {
    if (!response.data.error) {
      resolve(response.data);
    }
  }).catch((error) => {
    NotificationManager.error(error.response ? error.response.data.error : error.toString());
  });
});

export const getFlags = () => new Promise((resolve) => {
  getPromise(API_PATHS.GET.GET_FLAGS).then((response) => {
    if (!response.data.error) {
      resolve(response.data);
    }
  }).catch((error) => {
    NotificationManager.error(error.response ? error.response.data.error : error.toString());
  });
});

export const getUserId = () => new Promise((resolve) => {
  postPromise(API_PATHS.POST.GET_USER, { token: getCookie(cookiesNames.token) }).then((response) => {
    if (!response.data.error) {
      resolve(response.data._id);
    }
  }).catch((error) => {
    deleteCookie();
    window.location.reload();
    NotificationManager.error(error.response ? error.response.data.error : error.toString());
  });
});

export const createTry = () => new Promise((resolve) => {
  const tryName = moment().format('HH:mm DD.MM.YYYY');
  postPromise(API_PATHS.POST.CREATE_TRY, { token: getCookie(cookiesNames.token), tryName }).then((response) => {
    if (response && !response.data.error) {
      resolve(response.data);
    }
  }).catch((error) => {
    NotificationManager.error(error.response ? error.response.data.error : error.toString());
  });
});

export const sendFlag = flagCode => new Promise((resolve) => {
  postPromise(API_PATHS.POST.CHECK_FLAG, { flagCode }).then((response) => {
    if (!response.data.error) {
      NotificationManager.success('Flag is correct', '');
      resolve();
    }
  }).catch((error) => {
    NotificationManager.error(error.response ? error.response.data.error : error.toString());
  });
});

export const createUser = (name, password, inviteCode) => new Promise((resolve) => {
  password = hash.MD5(password);
  postPromise(API_PATHS.POST.CREATE_USER, { name, password, inviteCode }).then((response) => {
    if (!response.data.error) {
      NotificationManager.success('Successful registration', '');
      resolve();
    }
  }).catch((error) => {
    NotificationManager.error(error.response ? error.response.data.error : error.toString());
  });
});

export const logIn = (name, password) => new Promise((resolve) => {
  password = hash.MD5(password);
  postPromise(API_PATHS.POST.LOG_IN, { name, password }).then((response) => {
    if (!response.data.error) {
      setCookie(cookiesNames.token, response.data);
      NotificationManager.success('Successful LogIn', '');
      resolve();
    }
  }).catch((error) => {
    NotificationManager.error(error.response ? error.response.data.error : error.toString());
  });
});
