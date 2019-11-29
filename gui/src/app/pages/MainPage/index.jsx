import React, { Component } from 'react'; import hash from 'object-hash';


import { NotificationContainer, NotificationManager } from 'react-notifications';
import {
  cookiesNames, deleteCookie, getCookie, setCookie,
} from '../../services/authService';

import Header from '../../components/Header';
import LabsPage from '../../components/LabsPage';
import PromoPage from '../../components/PromoPage';


import './styles.css';
import { postPromise } from '../../services/apiService';
import { API_PATHS } from '../../../constants';

class MainPage extends Component {
    state = {
      isLogin: !!getCookie(cookiesNames.token),
    };

    logIn = (name, password) => {
      password = hash.MD5(password);
      postPromise(API_PATHS.POST.LOG_IN, { name, password }).then((response) => {
        if (response.error) {
          NotificationManager.error('Error', response.error);
        } else {
          setCookie(cookiesNames.token, response.data);
          NotificationManager.success('Successful LogIn', '');
          this.setState({ isLogin: true });
        }
      });
    };

    logOut = () => {
      deleteCookie();
      this.setState({ isLogin: false });
    };

    render() {
      const {
        isLogin,
      } = this.state;
      // const { objects, tasks } = this.props.context;
      // const { getTasksList, editTask } = tasks.functions;


      return (
        <div className="main">
          <Header isLogin={isLogin} logIn={this.logIn} logOut={this.logOut} />
          {isLogin ? <LabsPage /> : <PromoPage />}
          <NotificationContainer />
        </div>
      );
    }
}

export default MainPage;
