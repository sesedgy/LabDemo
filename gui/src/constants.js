export const APP_NAME = 'Clean Manager'; // Название приложения

export const API_CONFIG = {
  protocol: 'http',
  hostName: 'localhost:8000/api',
};

export const API_PATHS = {
  GET: {
    GET_SERVICES: 'services',
    GET_TRIES: 'tries',
    GET_FLAGS: 'flags',
  },
  POST: {
    GET_USERS: 'users',
    CREATE_TRY: 'tries/createTry',
    CHECK_FLAG: 'tries/checkFlag',
    LOG_IN: 'users/login',
    CREATE_USER: 'users',
  },
};

export const HOURS_FROM_LAST_LAB = 30;
export const COOKIE_EXPIRE_DAYS = 30;
