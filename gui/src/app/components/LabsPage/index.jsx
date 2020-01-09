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
import Tooltip from '../Tooltip';

import './styles.css';
import RootLabel from '../RootLabel';
import ServiceDialog from '../ServiceDialog';


const styles = {
  grow: {
    flexGrow: 1,
    textAlign: 'left',
  },
  textField: {
    display: 'block',
    margin: '10px',
    width: 'calc(100% - 20px)',
    borderColor: '#ffffff',
  },
  disabledButton: {
    color: 'rgba(256, 256, 256, 0.46) !important',
  },
  notchedOutline: {
    borderWidth: '1px',
    borderColor: '#ececec !important',
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
  button: {
    margin: '10px',
    width: 'calc(100% - 20px)',
    backgroundImage: 'linear-gradient( 69deg, rgb(37,52,67) 0%, rgb(37,52,67) 100%)',
    color: '#ececec',
  },
};

class LabsPage extends Component {
    allTries = [];

    allServices = [];

    allFlags = [];

    isLoading = false;

    state = {
      userId: null,
      tries: [],
      flags: [],
      selectedUserId: null,
      flag: '',
      selectedSolutionId: null,
      openModal: false,
      selectedServiceFlags: null,
      selectedUserName: null,
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
          this.isLoading = true;

          const tries = this.allTries.filter(item => item.userId === userId);
          const lastTry = tries[tries.length - 1];
          if (lastTry) {
            this.selectSolution(lastTry._id);
          }
          this.allServices = this.allServices.map(service => ({
            ...service,
            flags: this.allFlags
              .filter(flag => flag.serviceName === service.name && flag.flagStatus === 'solved')
              .map((flag) => {
                const item = this.allTries.find(item => item._id === flag.tryId);
                let submitTime = moment(flag.submitTime);
                const startTime = moment(item.startTime);
                submitTime = submitTime.subtract(startTime.hour(), 'hours');
                submitTime = submitTime.subtract(startTime.minute(), 'minutes');
                submitTime = submitTime.subtract(startTime.second(), 'seconds');

                return {
                  ...flag,
                  wasteTime: submitTime.format('HH:mm:ss'),
                  userName: item.userName,
                  userId: item.userId,
                };
              }),
          }));


          this.setState({
            userId,
            selectedUserId: userId,
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
          const lastTry = tries[tries.length - 1];
          if (lastTry) {
            this.selectSolution(lastTry._id);
          }

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
          this.allServices = this.allServices.map(service => ({
            ...service,
            flags: this.allFlags
              .filter(flag => flag.serviceName === service.name && flag.flagStatus === 'solved')
              .map((flag) => {
                const item = this.allTries.find(item => item._id === flag.tryId);
                let submitTime = moment(flag.submitTime);
                const startTime = moment(item.startTime);
                submitTime = submitTime.subtract(startTime.hour(), 'hours');
                submitTime = submitTime.subtract(startTime.minute(), 'minutes');
                submitTime = submitTime.subtract(startTime.second(), 'seconds');

                return {
                  ...flag,
                  wasteTime: submitTime.format('HH:mm:ss'),
                  userName: item.userName,
                  userId: item.userId,
                };
              }),
          }));

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

    onUserClick = (userId, tryId, userName) => {
      const tries = this.allTries.filter(item => item.userId === userId);
      this.selectSolution(tryId);

      this.setState({
        selectedUserId: userId,
        tries,
        flag: '',
        selectedUserName: userName,
      });
    };

    openModal = (selectedServiceFlags) => {
      this.setState({
        openModal: true,
        selectedServiceFlags,
      });
    };

    closeModal = () => {
      this.setState({
        openModal: false,
      });
    };

    getVpnConfig = () => {
      createTry().then((response) => {
        response = response.replace(/#/g, '//');

        const blob = new Blob([response], { type: 'text/plain' });
        const link = document.createElement('a');
        document.body.appendChild(link);
        link.setAttribute('download', 'config.ovpn');
        link.setAttribute('href', window.URL.createObjectURL(blob));
        link.click();
        document.body.removeChild(link);
      });
    };

    render() {
      const {
        userId, tries, flags, selectedUserId, flag, selectedSolutionId, openModal, selectedServiceFlags, selectedUserName,
      } = this.state;
      const { classes } = this.props;

      let lastTry = null;
      let labIsEnabled = false;
      let labInProgress = false;
      let labIsDisabled = false;
      let now = moment();
      let finishTime = null;
      let finishTimeWithPause = null;
      if (userId === selectedUserId && this.isLoading) {
        if (tries.length > 0) {
          lastTry = tries[tries.length - 1];
          now = moment();
          finishTime = moment(lastTry.finishTime);
          finishTimeWithPause = moment(lastTry.finishTime).add(HOURS_FROM_LAST_LAB, 'h');
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

      return (
        <div className="labs-page">
          <div className="services_container">
            <div className="row">
              {this.allServices.filter(service => service.level === 1).map(service => (
                <Tooltip onUserClick={this.onUserClick} flagsList={service.flags} userId={userId} key={service.id} openModal={() => this.openModal(service.flags)}>
                  <div className="service" style={{ opacity: flags.filter(item => item.serviceName === service.name).length === 0 ? 0.5 : 1 }} onClick={() => this.openModal(service.flags)}>
                    <img className="image" src={ComputerImg} alt="" />
                    <img className="image-target" style={{ display: flags.filter(item => item.serviceName === service.name && item.flagStatus === 'solved').length > 0 ? 'block' : 'none' }} src={TargetImg} alt="" />
                    <div className="label">{service.name}</div>
                    {flags.some(item => item.serviceName === service.name && item.flagType === '1' && item.flagStatus === 'solved') && <RootLabel />}
                  </div>
                </Tooltip>
              ))}
            </div>
            <div className="row">
              {this.allServices.filter(service => service.level === 2).map(service => (
                <Tooltip onUserClick={this.onUserClick} flagsList={service.flags} userId={userId} key={service.id} openModal={() => this.openModal(service.flags)}>
                  <div className="service" style={{ opacity: flags.filter(item => item.serviceName === service.name).length === 0 ? 0.5 : 1 }} onClick={() => this.openModal(service.flags)}>
                    <img className="image" src={ComputerImg} alt="" />
                    <img className="image-target" style={{ display: flags.filter(item => item.serviceName === service.name && item.flagStatus === 'solved').length > 0 ? 'block' : 'none' }} src={TargetImg} alt="" />
                    <div className="label">{service.name}</div>
                    {flags.some(item => item.serviceName === service.name && item.flagType === '1' && item.flagStatus === 'solved') && <RootLabel />}
                  </div>
                </Tooltip>
              ))}
            </div>
            <div className="row">
              {this.allServices.filter(service => service.level === 3).map(service => (
                <Tooltip onUserClick={this.onUserClick} flagsList={service.flags} userId={userId} key={service.id} openModal={() => this.openModal(service.flags)}>
                  <div className="service" style={{ opacity: flags.filter(item => item.serviceName === service.name).length === 0 ? 0.5 : 1 }} onClick={() => this.openModal(service.flags)}>
                    <img className="image" src={ComputerImg} alt="" />
                    <img className="image-target" style={{ display: flags.filter(item => item.serviceName === service.name && item.flagStatus === 'solved').length > 0 ? 'block' : 'none' }} src={TargetImg} alt="" />
                    <div className="label">{service.name}</div>
                    {flags.some(item => item.serviceName === service.name && item.flagType === '1' && item.flagStatus === 'solved') && <RootLabel />}
                  </div>
                </Tooltip>
              ))}
            </div>
          </div>
          <div className="right-bar">
            {selectedUserId === userId
              && (
              <>
                <div className="timer_container">
                  {(labInProgress || labIsDisabled) && (
                  <div className="timer">
                    <Countdown date={labInProgress ? finishTime : finishTimeWithPause} onComplete={() => { this.setState({ flag: '' }); }} />
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
                        classes={{ disabled: classes.disabledButton }}
                        onClick={() => {
                          this.createTry();
                        }}
                      >
                            Create new lab
                      </Button>
                    </div>
                    )}
                  {(labInProgress)
                    && (
                    <div className="btn_container">
                      <Button
                        variant="contained"
                        color="primary"
                        className={classes.button}
                        onClick={() => {
                          this.getVpnConfig();
                        }}
                      >
                            Get VPN config
                      </Button>
                    </div>
                    )}
                </div>
                  {labInProgress && (
                  <div className="flag_container">
                    <TextField
                      label="Name"
                      InputProps={{
                        classes: {
                          notchedOutline: classes.notchedOutline,
                          input: classes.inputMultiline,
                        },
                      }}
                      InputLabelProps={{
                        className: classes.floatingLabelFocusStyle,
                        classes: {
                          shrink: classes.inputLabelShrink,
                        },
                      }}
                      className={classes.textField}
                      value={flag}
                      fullWidth
                      variant="outlined"
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
                {tries.length > 0 && <>{selectedUserId === userId ? 'Your solutions' : `${selectedUserName}'s solutions`}</>}
              </div>
              <div className={selectedUserId === userId ? 'solutions-list' : 'solutions-list others'}>
                {tries.map(item => (
                  <div className="solution_container" key={item._id}>
                    <div className={selectedSolutionId === item._id ? 'solution selected' : 'solution'} onClick={() => { this.selectSolution(item._id); }}>{item.tryName}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {openModal
            && (
            <ServiceDialog
              open={openModal}
              flagsList={selectedServiceFlags}
              onClose={this.closeModal}
              userId={userId}
              onUserClick={this.onUserClick}
            />
            )
            }
        </div>
      );
    }
}

export default withStyles(styles)(LabsPage);
