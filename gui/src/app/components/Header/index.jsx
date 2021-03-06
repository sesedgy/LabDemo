import React from 'react';
import { withStyles } from '@material-ui/core/styles';

import IconButton from '@material-ui/core/IconButton/IconButton';
import AccountCircle from '@material-ui/icons/AccountCircle';
import Toolbar from '@material-ui/core/Toolbar/Toolbar';
import Popover from '@material-ui/core/Popover';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { createUser } from '../../services/apiService';

import LogoImg from '../../../images/Logo.png';

import './styles.css';


const styles = {
  grow: {
    flexGrow: 1,
    textAlign: 'left',
  },
  popover: {
    borderRadius: '0',
    color: '#ececec',
    position: 'absolute',
    top: '60px !important',
  },
  textField: {
    display: 'block',
    margin: '10px',
    width: '220px',
  },
  button: {
    margin: '10px',
    width: 'calc(100% - 20px)',
    backgroundImage: 'linear-gradient( 69deg, rgb(37,52,67) 0%, rgb(37,52,67) 100%)',
    color: '#ececec',
  },
  underline: {
    '&:before': {
      borderColor: '#ececec !important',
    },
    '&:after': {
      borderColor: '#ececec !important',
    },
  },
  floatingLabelFocusStyle: {
    color: '#ececec !important',
  },
  inputLabelShrink: {
    color: '#ececec !important',
  },
  inputMultiline: {
    color: '#ececec !important',
  },

};

// onClick={() => { signOut(); }}
class Header extends React.Component {
    state = {
      anchorEl: null,
      popupMode: null,
      name: '',
      password: '',
      registrationName: '',
      registrationPassword: '',
      inviteId: '',
    };

    render() {
      const {
        anchorEl, popupMode, name,
        password,
        registrationName,
        registrationPassword,
        inviteId,
      } = this.state;
      const {
        classes, isLogin, logIn, logOut,
      } = this.props;

      const open = !!anchorEl;
      const id = open ? 'simple-popover' : undefined;

      return (
        <div className="header">
          <Toolbar>
            <div className="logo_container">
              <img className="image" src={LogoImg} onClick={() => window.location.reload()} />
            </div>
            {isLogin ? (
              <>
                <span
                  className="my-statistic-label"
                  onClick={() => window.location.reload()}
                >
                    My Statistic
                </span>
                <IconButton
                  className={popupMode === 'account' ? 'account-btn active' : 'account-btn'}
                  onClick={(event) => {
                    this.setState({ anchorEl: event.currentTarget, popupMode: 'account' });
                  }}
                >
                  <AccountCircle className="icon" color="secondary" />
                </IconButton>
              </>
            )
              : (
                <div className="login_container">
                  <span
                    className={popupMode === 'logIn' ? 'link login-link active' : 'link login-link'}
                    onClick={(event) => {
                      this.setState({ anchorEl: event.currentTarget, popupMode: 'logIn' });
                    }}
                  >
                    LogIn
                  </span>
                  <span
                    className={popupMode === 'registration' ? 'link registration-link active' : 'link registration-link'}
                    onClick={(event) => {
                      this.setState({ anchorEl: event.currentTarget, popupMode: 'registration' });
                    }}
                  >
                    Registration
                  </span>
                </div>
              )}
          </Toolbar>
          <Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
            classes={{ paper: classes.popover }}
            onClose={() => {
              this.setState({ anchorEl: null, popupMode: null });
            }}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'center',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'center',
            }}
          >
            <div className="popover">
              {
                popupMode === 'account' && <div className="link" onClick={() => { logOut(); this.setState({ anchorEl: null, popupMode: null }); }}>LogOut</div>
            }
              {
                popupMode === 'logIn' && (
                <>
                  <TextField
                    label="Name"
                    className={classes.textField}
                    value={name}

                    fullWidth
                    InputProps={{
                      classes: {
                        notchedOutline: classes.notchedOutline,
                        input: classes.inputMultiline,
                        underline: classes.underline,
                      },
                    }}
                    InputLabelProps={{
                      className: classes.floatingLabelFocusStyle,
                      classes: {
                        shrink: classes.inputLabelShrink,
                      },
                    }}
                    onChange={(e) => { this.setState({ name: e.target.value }); }}
                  />
                  <TextField
                    label="Password"
                    type="password"
                    InputProps={{
                      classes: {
                        notchedOutline: classes.notchedOutline,
                        input: classes.inputMultiline,
                        underline: classes.underline,
                      },
                    }}
                    InputLabelProps={{
                      className: classes.floatingLabelFocusStyle,
                      classes: {
                        shrink: classes.inputLabelShrink,
                      },
                    }}
                    className={classes.textField}
                    value={password}
                    fullWidth
                    onChange={(e) => { this.setState({ password: e.target.value }); }}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    className={classes.button}
                    onClick={() => {
                      logIn(name, password); this.setState({
                        anchorEl: null, popupMode: null, name: '', password: '',
                      });
                    }}
                  >
                        LogIn
                  </Button>

                </>
                )
            }
              {
                popupMode === 'registration' && (
                <>
                  <TextField
                    label="Name"
                    className={classes.textField}
                    value={registrationName}
                    InputProps={{
                      classes: {
                        notchedOutline: classes.notchedOutline,
                        input: classes.inputMultiline,
                        underline: classes.underline,
                      },
                    }}
                    InputLabelProps={{
                      className: classes.floatingLabelFocusStyle,
                      classes: {
                        shrink: classes.inputLabelShrink,
                      },
                    }}

                    fullWidth
                    onChange={(e) => { this.setState({ registrationName: e.target.value }); }}
                  />
                  <TextField
                    label="Password"
                    type="password"
                    InputProps={{
                      classes: {
                        notchedOutline: classes.notchedOutline,
                        input: classes.inputMultiline,
                        underline: classes.underline,
                      },
                    }}
                    InputLabelProps={{
                      className: classes.floatingLabelFocusStyle,
                      classes: {
                        shrink: classes.inputLabelShrink,
                      },
                    }}
                    className={classes.textField}
                    value={registrationPassword}
                    fullWidth
                    onChange={(e) => { this.setState({ registrationPassword: e.target.value }); }}
                  />
                  <TextField
                    label="Invite code"
                    InputProps={{
                      classes: {
                        notchedOutline: classes.notchedOutline,
                        input: classes.inputMultiline,
                        underline: classes.underline,
                      },
                    }}
                    InputLabelProps={{
                      className: classes.floatingLabelFocusStyle,
                      classes: {
                        shrink: classes.inputLabelShrink,
                      },
                    }}
                    className={classes.textField}
                    value={inviteId}
                    fullWidth
                    onChange={(e) => { this.setState({ inviteId: e.target.value }); }}
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    className={classes.button}
                    onClick={() => {
                      createUser(registrationName, registrationPassword, inviteId); this.setState({
                        anchorEl: null, popupMode: null, registrationName: '', registrationPassword: '', inviteId: '',
                      });
                    }}
                  >
                        Create account
                  </Button>
                </>
                )
            }
            </div>
          </Popover>
        </div>
      );
    }
}
export default withStyles(styles)(Header);
