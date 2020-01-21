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
import ArrowImg from '../../../images/arrow.svg';
import WindowsImg from '../../../images/windows.svg';
import LinuxImg from '../../../images/linux.svg';
import CrownImg from '../../../images/crown.svg';
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

    timerIsComplete = false;

    countDown = null;

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
          this.allTries = results[0].sort((a, b) => (a.finishTime > b.finishTime ? 1 : a.finishTime < b.finishTime ? -1 : 0));
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
        Promise.all([getTries(), getFlags()]).then((results) => {
          this.allTries = results[0].sort((a, b) => (a.finishTime > b.finishTime ? 1 : a.finishTime < b.finishTime ? -1 : 0));
          this.allFlags = results[1];
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
            tries,
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
      let nowWithSeconds = null;
      console.log(tries);
      if (userId === selectedUserId && this.isLoading) {
        if (tries.length > 0) {
          lastTry = tries[tries.length - 1];
          now = moment();
          nowWithSeconds = now.add(2, 'seconds');
          finishTime = moment(lastTry.finishTime);
          finishTimeWithPause = moment(lastTry.finishTime).add(HOURS_FROM_LAST_LAB, 'h');
          if (finishTime > now) {
            labInProgress = true;
          }
          if (finishTime < now && finishTimeWithPause <= nowWithSeconds) {
            labIsEnabled = true;
          }
          if (finishTime < now && finishTimeWithPause > now) {
            labIsDisabled = true;
          }
        }
        if (!lastTry) {
          labIsEnabled = true;
        }
      }
      if (this.timerIsComplete) {
        this.countDown.start();
        this.timerIsComplete = false;
      }

      return (
        <div className="labs-page">
          <div className="services_container">
            <div className="row">
              {this.allServices.filter(service => service.level === 1).map(service => (
                <Tooltip onUserClick={this.onUserClick} flagsList={service.flags} userId={userId} key={service.id} openModal={() => this.openModal(service.flags)}>
                  <div className="service" style={{ opacity: flags.filter(item => item.serviceName === service.name).length === 0 ? 0.4 : 1 }} onClick={() => this.openModal(service.flags)}>
                    <img className="image" src={ComputerImg} alt="" />
                    <img className="image-logo" src={WindowsImg} />
                    <img className="image-target" style={{ display: flags.filter(item => item.serviceName === service.name && item.flagStatus === 'solved').length > 0 ? 'block' : 'none' }} src={CrownImg} alt="" />
                    <div className="label">{service.name}</div>
                    {flags.some(item => item.serviceName === service.name && item.flagType === '1' && item.flagStatus === 'solved') && <RootLabel />}
                  </div>
                </Tooltip>
              ))}
            </div>
            <div className="row">
              {this.allServices.filter(service => service.level === 2).map((service, index) => (
                <Tooltip onUserClick={this.onUserClick} flagsList={service.flags} userId={userId} key={service.id} openModal={() => this.openModal(service.flags)}>
                  <div className="service" style={{ opacity: flags.filter(item => item.serviceName === service.name).length === 0 ? 0.4 : 1 }} onClick={() => this.openModal(service.flags)}>
                    <img className="image" src={ComputerImg} alt="" />
                    <img className="image-logo" src={LinuxImg} />
                    <img
                      className="arrow"
                      src={ArrowImg}
                      alt=""
                      style={{
                        top: '-78px', transform: 'rotate(90deg)', left: index === 0 ? '84px' : '-4px', opacity: flags.filter(item => item.serviceName === service.name).length === 0 ? 0 : 1,
                      }}
                    />
                    <img className="image-target" style={{ display: flags.filter(item => item.serviceName === service.name && item.flagStatus === 'solved').length > 0 ? 'block' : 'none' }} src={CrownImg} alt="" />
                    <div className="label">{service.name}</div>
                    {flags.some(item => item.serviceName === service.name && item.flagType === '1' && item.flagStatus === 'solved') && <RootLabel />}
                  </div>
                </Tooltip>
              ))}
            </div>
            <div className="row">
              {this.allServices.filter(service => service.level === 3).map((service, index) => (
                <Tooltip onUserClick={this.onUserClick} flagsList={service.flags} userId={userId} key={service.id} openModal={() => this.openModal(service.flags)}>
                  <div className="service" style={{ opacity: flags.filter(item => item.serviceName === service.name).length === 0 ? 0.4 : 1 }} onClick={() => this.openModal(service.flags)}>
                    <img className="image" src={ComputerImg} alt="" />
                    <img className="image-logo" src={LinuxImg} />
                    {flags.filter(item => item.serviceName === this.allServices.filter(service => service.level === 2)[0].name).length !== 0 && (
                      <img
                        className="arrow"
                        src={ArrowImg}
                        alt=""
                        style={{
                          top: '-78px', transform: index === 0 ? 'rotate(90deg)' : index === 1 ? 'rotate(90deg)' : 'rotate(38deg)', left: index === 0 ? '84px' : index === 1 ? '-4px' : '-82px', opacity: flags.filter(item => item.serviceName === service.name).length === 0 ? 0 : 1,
                        }}
                      />
                    )}
                    {flags.filter(item => item.serviceName === this.allServices.filter(service => service.level === 2)[1].name).length !== 0 && (
                    <img
                      className="arrow"
                      src={ArrowImg}
                      alt=""
                      style={{
                        top: '-78px', transform: index === 0 ? 'rotate(140deg)' : 'rotate(90deg)', left: index === 0 ? '162px' : index === 1 ? '84px' : '-4px', opacity: flags.filter(item => item.serviceName === service.name).length === 0 ? 0 : 1,
                      }}
                    />
                    )}
                    <img className="image-target" style={{ display: flags.filter(item => item.serviceName === service.name && item.flagStatus === 'solved').length > 0 ? 'block' : 'none' }} src={CrownImg} alt="" />
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
                    <Countdown ref={el => this.countDown = el} date={labInProgress ? finishTime : finishTimeWithPause} onComplete={() => { this.timerIsComplete = true; this.setState({ flag: '' }); }} />
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
                      label="Flag"
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
                {tries.map((item, index) => (
                  <div className="solution_container" key={item._id}>
                    <div className={selectedSolutionId === item._id ? 'solution selected' : 'solution'} onClick={() => { this.selectSolution(item._id); }}>
                      {(selectedUserId === userId && labInProgress && ((index + 1) === tries.length)) ? 'Current solution' : item.tryName}
                    </div>
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
