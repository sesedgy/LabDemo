import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';

import './styles.css';
import { NotificationManager } from 'react-notifications';
import moment from 'moment';
import Button from '@material-ui/core/Button';
import Countdown from 'react-countdown-now';
import TextField from '@material-ui/core/TextField';
import { getPromise, postPromise } from '../../services/apiService';
import { API_PATHS, HOURS_FROM_LAST_LAB } from '../../../constants';
import { cookiesNames, getCookie } from '../../services/authService';

import ComputerImg from '../../../images/computer.svg';


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

class LabsPage extends Component {
    allTries = [];
    allFlags = [];
    allServices = [];

    state = {
      userId: null,
      tries: [],
      services: [],
      flags: [],
      isOtherUserMode: false,
      flag: '',
    };

    componentDidMount() {
      getPromise(API_PATHS.POST.GET_USERS, { token: getCookie(cookiesNames.token) }).then((response) => {
        if (response.error) {
          NotificationManager.error('Error', response.error);
        } else {
          const userId = response._id;


          this.setState({
            userId,
          });
        }
      });

      this.getTries();
      getPromise(API_PATHS.GET.GET_SERVICES).then((response) => {
        if (response.error) {
          NotificationManager.error('Error', response.error);
        } else {
          this.setState({
            services: response.data,
          });
        }
      });
    }

    getTries = () => {
      getPromise(API_PATHS.GET.GET_TRIES, { token: getCookie(cookiesNames.token) })
        .then((response) => {
          if (response.error) {
            NotificationManager.error('Error', response.error);
          } else {
            this.allTries = response.data;
          }
        });
    };

    getFlagsByTryId = (tryId) => {
      postPromise(API_PATHS.POST.GET_FLAGS, { tryId })
        .then((response) => {
          if (response.error) {
            NotificationManager.error('Error', response.error);
          } else {
            this.setState({
              flags: response.data,
            });
          }
        });
    };

    createTry = () => {
      const tryName = moment().format('HH:mm DD.MM.YYYY');
      postPromise(API_PATHS.POST.CREATE_TRY, { token: getCookie(cookiesNames.token), tryName })
        .then((response) => {
          if (response.error) {
            NotificationManager.error('Error', response.error);
          } else {
            this.getTries();
          }
        });
    };

    sendFlag = () => {
      postPromise(API_PATHS.POST.CHECK_FLAG, { flagCode: this.state.flag })
        .then((response) => {
          if (response.error) {
            NotificationManager.error('Error', response.error);
          } else {
            NotificationManager.success('Flag is correct', '');
            this.setState({ flag: '' });
          }
        });
    };

    render() {
      const {
        tries, services, isOtherUserMode, flag,
      } = this.state;
      const { classes } = this.props;

      let lastTry = null;
      let labIsEnabled = false;
      let labInProgress = false;
      let labIsDisabled = false;
      let now = moment();
      let finishTime = null;
      let finishTimeWithPause = null;
      if (!isOtherUserMode) {
        if (tries.length > 0) {
          lastTry = tries[tries.length - 1];
          now = moment();
          finishTime = moment(lastTry.finishTime);
          finishTimeWithPause = finishTime.add(HOURS_FROM_LAST_LAB, 'h');
          if (finishTime > now) {
            labInProgress = true;
          }
          if (finishTime < now && finishTimeWithPause < now) {
            labIsEnabled = true;
          }
          if (finishTime < now && finishTimeWithPause >= now) {
            labIsDisabled = true;
          }
        }
        if (!lastTry) {
          labIsEnabled = true;
        }
      }


      console.log(tries);
      console.log(services);
      return (
        <div className="labs-page">
          <div className="services_container">
            <div className="row">
              {services.filter(service => service.level === 1).map(service => (
                <div className="service">
                  <img className="image" src={ComputerImg} />
                  <div className="label">{service.name}</div>
                </div>
              ))}
            </div>
            <div className="row">
              {services.filter(service => service.level === 2).map(service => (
                <div className="service">
                  <img className="image" src={ComputerImg} />
                  <div className="label">{service.name}</div>
                </div>
              ))}
            </div>
            <div className="row">
              {services.filter(service => service.level === 3).map(service => (
                <div className="service">
                  <img className="image" src={ComputerImg} />
                  <div className="label">{service.name}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="right-bar">
            {!isOtherUserMode
              && (
              <>
                <div className="timer_container">
                  {(labInProgress || labIsDisabled) && (
                  <div className="timer">
                    <Countdown date={labInProgress ? finishTime : finishTimeWithPause} />
                  </div>
                  )}
                  {(labIsEnabled || labIsDisabled)
                    && (
                    <div className="btn_container">
                      <Button
                        variant="contained"
                        color="primary"
                        disabled={labIsDisabled}
                        className={classes.button}
                        onClick={() => {
                          this.createTry();
                        }}
                      >
                            Create new lab
                      </Button>
                    </div>
                    )}
                </div>
                  {labInProgress && (
                  <div className="flag_container">
                    <TextField
                      label="Name"
                      className={classes.textField}
                      value={flag}
                      fullWidth
                      onChange={(e) => { this.setState({ flag: e.target.value }); }}
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      className={classes.button}
                      onClick={() => {
                        this.sendFlag();
                      }}
                    >
                          Send flag
                    </Button>
                  </div>
                  )}
              </>
              )}
            <div className="solutions_container">
              <div className="user">
                {isOtherUserMode ? '' : 'Your solutions'}
              </div>
              <div className="solutions-list">
                {tries.map(item => <div className="solution">{item.tryName}</div>)}
              </div>
            </div>
          </div>
        </div>
      );
    }
}

export default withStyles(styles)(LabsPage);
