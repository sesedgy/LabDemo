import React, { Component } from 'react';

import { cookiesNames, getCookie } from '../../services/authService';

import './styles.css';

class MainPage extends Component {
    state = {
      isLogin: !!getCookie(cookiesNames.token),
    };

    componentDidMount() {
    }

    render() {
      return (
        <div>
              Promo
        </div>
      );
    }
}

export default MainPage;
