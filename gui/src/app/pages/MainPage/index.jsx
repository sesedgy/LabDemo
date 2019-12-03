import React, { Component } from 'react';
import { NotificationContainer } from 'react-notifications';

import Header from '../../components/Header';
import LabsPage from '../../components/LabsPage';
import PromoPage from '../../components/PromoPage';

import {
  cookiesNames, deleteCookie, getCookie,
} from '../../services/authService';
import { logIn } from '../../services/apiService';

import './styles.css';

class MainPage extends Component {
    state = {
      isLogin: !!getCookie(cookiesNames.token),
    };

    logIn = (name, password) => {
      logIn(name, password).then(() => {
        this.setState({ isLogin: true });
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
