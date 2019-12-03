import React from 'react';
import 'react-notifications/lib/notifications.css';

import { BrowserRouter as Router, Route } from 'react-router-dom';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';

import routes from './routes';

import './App.css';

const theme = createMuiTheme({
  palette: {
    primary: {
      50: '#4fb3bf',
      100: '#4fb3bf',
      200: '#4fb3bf',
      300: '#4fb3bf',
      400: '#4fb3bf',
      500: '#4fb3bf',
      600: '#4fb3bf',
      700: '#4e8592',
      800: '#142631',
      900: '#142631',
      A100: '#4fb3bf',
      A200: '#4fb3bf',
      A400: '#4fb3bf',
      A700: '#163142',
    },
    secondary: {
      500: '#fff',
      600: '#fff',
      700: '#fff',
      800: '#fff',
      A400: '#fff',
    },
  },
  overrides: {
    MuiInput: {
      underline: {
        '&:before': { // underline color when textfield is inactive
          backgroundColor: 'red',
        },
        '&:hover:not($disabled):before': { // underline color when hovered
          backgroundColor: 'green',
        },
      },
    },
  },
});

const App = () => (
  <div className="App">
    <MuiThemeProvider theme={theme}>
      <Router>
        {routes.map(
          route => (
            <Route
              key={route.path}
              {...route}
            />
          ),
        )}
      </Router>
    </MuiThemeProvider>
  </div>
);

export default App;
