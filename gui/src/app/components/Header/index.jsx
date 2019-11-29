import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import hash from 'object-hash';

import IconButton from '@material-ui/core/IconButton/IconButton';
import AccountCircle from '@material-ui/icons/AccountCircle';
import Toolbar from '@material-ui/core/Toolbar/Toolbar';
import Typography from '@material-ui/core/Typography/Typography';
import Popover from '@material-ui/core/Popover';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import { NotificationManager } from 'react-notifications';

import './styles.css';
import { postPromise } from '../../services/apiService';
import { API_PATHS } from '../../../constants';

const styles = {
  grow: {
    flexGrow: 1,
    textAlign: 'left',
  },
  textField: {
    display: 'block',
    margin: '10px',
    width: '220px',
  },
  button: {
    margin: '10px',
    width: 'calc(100% - 20px)',
  },
};

// onClick={() => { signOut(); }}
class Header extends React.Component {
    state = {
      anchorEl: null,
      popupMode: 'logIn',
      name: '',
      password: '',
      registrationName: '',
      registrationPassword: '',
      inviteId: '',
    };

    createUser = (name, password, inviteCode) => {
      password = hash.MD5(password);
      postPromise(API_PATHS.POST.CREATE_USER, { name, password, inviteCode }).then((response) => {
        if (response.error) {
          NotificationManager.error('Error', response.error);
        } else {
          NotificationManager.success('Successful registration', '');
        }
      });
    };

    render() {
      const {
        anchorEl, popupMode, name,
        password,
        registrationName,
        registrationPassword,
        inviteId,
      } = this.state;
      const { classes, isLogin, logIn, logOut } = this.props;

      const open = !!anchorEl;
      const id = open ? 'simple-popover' : undefined;

      return (
        <div className="header">
          <Toolbar>
            <Typography variant="h6" color="inherit" className={classes.grow}>Clean manager</Typography>
            {isLogin ? (
              <IconButton
                onClick={(event) => {
                  this.setState({ anchorEl: event.currentTarget, popupMode: 'account' });
                }}
              >
                <AccountCircle className="icon" color="secondary" />
              </IconButton>
            )
              : (
                <div className="login_container">
                  <span
                    className="link login-link"
                    onClick={(event) => {
                      this.setState({ anchorEl: event.currentTarget, popupMode: 'logIn' });
                    }}
                  >
                    LogIn
                  </span>
                  <span
                    className="link registration-link"
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
            onClose={() => {
              this.setState({ anchorEl: null });
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
                popupMode === 'account' && <div className="link" onClick={() => { logOut(); this.setState({ anchorEl: null }) }}>LogOut</div>
            }
              {
                popupMode === 'logIn' && (
                <>
                  <TextField
                    label="Name"
                    className={classes.textField}
                    value={name}
                    fullWidth
                    onChange={(e) => { this.setState({ name: e.target.value }); }}
                  />
                  <TextField label="Password" className={classes.textField} value={password} fullWidth onChange={(e) => { this.setState({ password: e.target.value }); }} />
                  <Button variant="contained" color="primary" className={classes.button} onClick={() => { logIn(name, password); this.setState({ anchorEl: null }) }}>
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
                    fullWidth
                    onChange={(e) => { this.setState({ registrationName: e.target.value }); }}
                  />
                  <TextField label="Password" className={classes.textField} value={registrationPassword} fullWidth onChange={(e) => { this.setState({ registrationPassword: e.target.value }); }} />
                  <TextField label="Invite code" className={classes.textField} value={inviteId} fullWidth onChange={(e) => { this.setState({ inviteId: e.target.value }); }} />
                  <Button variant="contained" color="primary" className={classes.button} onClick={() => { this.createUser(registrationName, registrationPassword, inviteId); this.setState({ anchorEl: null }) }}>
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
