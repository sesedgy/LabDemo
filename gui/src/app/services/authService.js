import Cookies from 'js-cookie';

import { COOKIE_EXPIRE_DAYS, API_PATHS } from '../../constants';

export const cookiesNames = {
  token: 'Token',
};

export const getCookie = name => Cookies.get(name);

export const setCookie = (name, value) => {
  Cookies.set(name, value, { expires: COOKIE_EXPIRE_DAYS });
};

export const deleteCookie = () => {
  Cookies.remove(cookiesNames.token);
};