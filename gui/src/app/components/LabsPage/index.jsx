import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import moment from 'moment';
import Button from '@material-ui/core/Button';
import Countdown from 'react-countdown-now';
import TextField from '@material-ui/core/TextField';
import {
  createTry,
  getFlags, getServices, getTries, getUserId, sendFlag,
} from '../../services/apiService';
import { HOURS_FROM_LAST_LAB } from '../../../constants';

import ComputerImg from '../../../images/computer.svg';
import TargetImg from '../../../images/target.svg';
import RightArrow from '../../../images/right-arrow.svg';
import Tooltip from '../Tooltip';

import './styles.css';


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

    allServices = [];

    allFlags = [];

    state = {
      userId: null,
      tries: [],
      flags: [],
      isOtherUserMode: false,
      flag: '',
      selectedSolutionId: null,
    };

    componentDidMount() {
      getUserId().then((userId) => {
        Promise.all([getTries(),
          getServices(),
          getFlags(),
        ]).then((results) => {
          this.allTries = results[0];
          this.allServices = results[1];
          this.allFlags = results[2];

          const tries = this.allTries.filter(item => item.userId === userId);
          const lastTry = tries[tries.length - 1];
          if (lastTry) {
            this.selectSolution(lastTry._id);
          }
          this.allServices.forEach((service) => {
            service.flags = this.allFlags
              .filter(flag => flag.serviceId === service.id)
              .forEach(flag => flag.userName = this.allTries.find(item => item._id === flag.tryId).userName);
          });


          this.setState({
            userId,
            tries,
          });
        });
      });
    }

    createTry = () => {
      const { userId } = this.state;
      createTry().then(() => {
        getTries().then((result) => {
          this.allTries = result;
          const tries = this.allTries.filter(item => item.userId === userId);
          this.setState({
            tries,
            flags: [],
          });
        });
      });
    };

    sendFlag = () => {
      const { userId } = this.state;
      sendFlag(this.state.flag).then(() => {
        getFlags().then((result) => {
          this.allFlags = result;
          const tries = this.allTries.filter(item => item.userId === userId);
          const lastTry = tries[tries.length - 1];
          if (lastTry) {
            this.selectSolution(lastTry._id);
          }
          this.setState({
            flag: '',
          });
        });
      });
    };

    selectSolution = (tryId) => {
      const flags = this.allFlags.filter(flag => flag.tryId === tryId);
      this.setState({
        selectedSolutionId: tryId,
        flags,
      });
    };

    render() {
      const {
        tries, flags, isOtherUserMode, flag, selectedSolutionId,
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

      console.log('////////////////');
      console.log(this.allFlags);
      console.log(flags);
      return (
        <div className="labs-page">
          <div className="services_container">
            <div className="row">
              {this.allServices.filter(service => service.level === 1).map(service => (
                <Tooltip>
                  <div className="service">
                    <img className="image" src={ComputerImg} />
                    <img className="image-target" style={{ display: flags.filter(flag => flag.serviceName === service.name).length > 0 ? 'block' : 'none' }} src={TargetImg} />
                    <div className="label">{service.name}</div>
                  </div>
                </Tooltip>
              ))}
            </div>
            <div className="row">
              {this.allServices.filter(service => service.level === 2).map(service => (
                <Tooltip>
                  <div className="service">
                    <img className="image" src={ComputerImg} />
                    <img className="image-target" style={{ display: flags.filter(flag => flag.serviceName === service.name).length > 0 ? 'block' : 'none' }} src={TargetImg} />
                    <div className="label">{service.name}</div>
                  </div>
                </Tooltip>
              ))}
            </div>
            <div className="row">
              {this.allServices.filter(service => service.level === 3).map(service => (
                <Tooltip>
                  <div className="service">
                    <img className="image" src={ComputerImg} />
                    <img className="image-target" style={{ display: flags.filter(flag => flag.serviceName === service.name).length > 0 ? 'block' : 'none' }} src={TargetImg} />
                    <div className="label">{service.name}</div>
                  </div>
                </Tooltip>
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
                {tries.length > 0 && <>{isOtherUserMode ? '' : 'Your solutions'}</>}
              </div>
              <div className="solutions-list">
                {tries.map(item => (
                  <div className="solution_container">
                    {selectedSolutionId === item._id && <img className="arrow-right" src={RightArrow} />}
                    <div className="solution" onClick={() => { this.selectSolution(item._id); }}>{item.tryName}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }
}

export default withStyles(styles)(LabsPage);
