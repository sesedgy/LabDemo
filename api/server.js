const express        = require('express');
const bodyParser     = require('body-parser');
const cors           = require('cors');
const config         = require('./config/config');
const log            = require('./config/log')(module); //Передаем  модуль в метод
const app            = express();
const request        = require('request');
const moment         = require('moment');
const UserModel            = require('./config/db').UserModel;
const InviteModel          = require('./config/db').InviteModel;
const HashService          = require('./lib/services/hash_service').HashService;
const TryModel             = require('./config/db').TryModel;
const FlagModel            = require('./config/db').FlagModel;

//global variables
global.__basedir = __dirname;

//For 'Access-Control-Allow-Origin'
app.use(cors({origin: config.get('appUrl')}));

app.use(bodyParser.urlencoded({ extended: true })); //Include JSON parser
app.use(bodyParser.json());

const labAPIUrl = config.get('labApiUrl');
const getServices = () => {
    return new Promise((resolve, reject) => {
        let clientServerOptions = {
            uri: labAPIUrl + "/api/tasks/all",
            method: 'GET',
        };
        request(clientServerOptions, (error, response) => {
            if(error){
                reject();
            }
            let result = JSON.parse(response.body).filter(service => service.level !== 0);
            resolve(result);
        });
    });
};

const getLab = () => {
    return new Promise((resolve, reject) => {

        let clientServerOptions = {
            uri: labAPIUrl + "/api/lab/get/random",
            method: 'GET',
        };
        request(clientServerOptions, (error, response) => {
            if(error){
                reject();
            }
            let flags = [];
            response = JSON.parse(response.body);
            response.services.forEach(service => {
                service.flag.forEach(flag => {flag.serviceName = service.name; flags.push(flag)});
            });
            const result = {
                labId: response.id,
                flags: flags
            };
            resolve(result);
        });
    });
};

const saveLab = (labId, tryId) => {
    return new Promise((resolve, reject) => {
        let clientServerOptions2 = {
            uri: labAPIUrl + "/api/lab/" + labId,
            body: JSON.stringify({lifetime: config.get('hoursForLabEnd'), try_id: tryId}),
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        };
        request(clientServerOptions2, (error, response) => {
            if(error){
                reject();
            }
            resolve();
        });
    });
};

const getVPNConfig = (labId) => {
    return new Promise((resolve, reject) => {
        let clientServerOptions = {
            uri: labAPIUrl + "/api/lab/" + labId + "/vpn",
            method: 'GET',
        };
        request(clientServerOptions, (error, response) => {
            if(error){
                reject();
            }
            resolve(response);
        });
    });
};

const getUser = (body) => {
    return new Promise((resolve, reject) => {
        UserModel.findOne({ 'token': body.token }, function (err, user) {
            if(!err){
                resolve(user)
            }else{
                reject()
            }
        });
    })
};

//Create user
app.post('/api/users', (req, res) => {
    InviteModel.findOne({ 'inviteCode': req.body.inviteCode }, (err, invite) => {
        if (!err && invite) {
            if(!invite){
                res.statusCode = 500;
                return res.send({ error: 'Incorrect invite' });
            }
            if(invite.status === "used"){
                res.statusCode = 500;
                return res.send({ error: 'Invite was used' });
            }
            let user = new UserModel({
                name: req.body.name,
                password: HashService.getHash(req.body.password),
                inviteId: invite.id,
            });
            InviteModel.update(
                {id: invite.id},
                {$set: {'status': "used"}},
                function (err) {
                    if (!err){
                        user.save(function (err) {
                            if (!err) {
                                return res.send({status: 'OK'});
                            } else {
                                res.statusCode = 500;
                                res.send({error: 'Server error'});
                            }
                        });
                    }else{
                        res.statusCode = 500;
                        return res.send({ error: 'Server error' });
                    }
                }
            );
        } else {
            res.statusCode = 500;
            return res.send({ error: 'Server error' });
        }
    });
});

//LogIn
app.post('/api/users/login', (req, res) => {
    UserModel.findOne({ 'name': req.body.name }, (err, user) => {
        if (!err) {
            if(HashService.compareWithHash(req.body.password, user.password)){
                let token = HashService.createGuidString();
                UserModel.update(
                    {_id: user._id},
                    {$set: {'token': token}}, (err) => {
                        if (!err){
                            return res.send(token);
                        }else{
                            res.statusCode = 500;
                            return res.send({ error: 'Server error' });
                        }
                    }
                )
            }else{
                res.statusCode = 500;
                return res.send({ error: 'Wrong username/password' });
            }
        } else {
            res.statusCode = 500;
            return res.send({ error: 'Wrong username/password' });
        }
    });
});


//Get tries
app.get('/api/tries', (req, res) => {
    TryModel.find({}, function (err, tries) {
        if (!err) {
            tries.forEach(item => {
                delete item.flagCode;
            });
            return res.send(tries);
        } else {
            res.statusCode = 500;
            return res.send({ error: 'Server error' });
        }
    });
});

//Get flags
app.get('/api/flags', (req, res) => {
    FlagModel.find({flagStatus: 'solved'}, function (err, flags) {
        if (!err) {
            flags = flags.map(flag => {
                return {
                    tryId: flag.tryId,
                    serviceName: flag.serviceName,
                    flagType: flag.flagType,
                }
            });
            return res.send(flags);
        } else {
            res.statusCode = 500;
            return res.send({ error: 'Server error' });
        }
    });
});

//Get user by token
app.post('/api/user', (req, res) => {
    UserModel.findOne({token:req.body.token }, (err, user) => {
        if (!err) {
            return res.send({_id: user._id, name: user.name});
        } else {
            res.statusCode = 500;
            return res.send({error: 'Server error'});
        }
    });
});

//Get services
app.get('/api/services', (req, res) => {
    getServices().then((result) => {
        return res.send(result);
    }).catch(() => {
        res.statusCode = 500;
        return res.send({ error: 'Server error' });
    })
});

//Create try
app.post('/api/tries/createTry', (req, res) => {
    getUser(req.body).then((user) => {
        TryModel.findOne({'userId': user._id}, {}, { sort: { 'created_at' : -1 } }, (err, item) => {
            if (!err) {
                let canCreateLab = false;
                let labIsActive = false;
                if(item){
                    let finishTimeDate = moment(item.finishTime);
                    let now = moment();
                    labIsActive = now < finishTimeDate;
                    if(!labIsActive && now > finishTimeDate.add(config.get('hoursFromLastLaba'), 'h')){
                        canCreateLab = true;
                    }
                }else{
                    canCreateLab = true;
                }

                if(canCreateLab){
                    getLab().then((result) => {
                        //Создаем лабу
                        let now = moment();
                        let finishTime = now.add(config.get('hoursFromLastLaba'), 'h');
                        let newTry = new TryModel({
                            userId: user._id,
                            userName: user.name,
                            tryName: req.body.tryName,
                            startTime: now,
                            finishTime: finishTime,
                            labId: result.labId
                        });
                        newTry.save((err, item) => {
                            saveLab(result.labId, item.id).then(() => {
                                console.log(item);
                                result.flags.forEach(flag => {
                                    let newFlag = new FlagModel({
                                        flagCode: flag.flag_code,
                                        flagType: flag.flag_type,
                                        flagStatus: "unsolved",
                                        tryId: item._id,
                                        serviceName: flag.serviceName,
                                    });
                                    console.log("////////////////////")
                                    console.log(newFlag)
                                    newFlag.save(() => {});
                                });
                                console.log('TUT')
                                return res.send({status: 'OK'});
                            }).catch(() => {
                                res.statusCode = 500;
                                return res.send({ error: 'Server error' });
                            });
                        });
                    }).catch(() => {
                        res.statusCode = 500;
                        return res.send({ error: 'Server error' });
                    });

                }else if(labIsActive){
                    //Отдаем текущий конфиг
                    getVPNConfig(item.labId); //TODO Затестить
                    return "vpnConfig Active laba";
                }else {
                    //Не пускаем, так как не прошло время с предыдущей
                    res.statusCode = 500;
                    return res.send({ error: 'You cant start a new laba' });
                }
            } else {
                res.statusCode = 500;
                return res.send({ error: 'Server error' });
            }
        });
    }).catch(() => {
        res.statusCode = 500;
        return res.send({ error: 'Server error' });
    })
});

//Check flag
app.post('/api/tries/checkFlag', (req, res) => {
    FlagModel.findOne({ 'flagCode': req.body.flagCode }, (err, flag) => {
        if (!err) {
            if(flag){
                FlagModel.update(
                    {id: flag.id},
                    {flagStatus: "solved", submitTime: new Date()},
                    function (err) {
                        if (!err){
                            return res.send({status: 'OK'});
                        }else{
                            res.statusCode = 500;
                            return res.send({ error: 'Server error' });
                        }
                    }
                );
            }else{
                res.statusCode = 500;
                return res.send({ error: 'Incorrect flag' });
            }
        } else {
            res.statusCode = 500;
            return res.send({ error: 'Server error' });
        }
    });
});

// //Get tries
// app.get('/api/tries', (req, res) => {
//     getUser(req.body).then((userId) => {
//         TryModel.find({ 'userId': userId }, function (err, tries) {
//             if (!err) {
//                 new Promise((resolve, reject) => {
//                     getServices().then((result) => {
//                         tries.forEach(item => {
//                             FlagModel.find({ 'tryId': item.id }, function (err, flags) {
//                                 console.log(item.id)
//                                 if (!err) {
//                                     flags.forEach(flag => {
//                                         let service = result.find(service => service.id === flag.serviceId);
//                                         delete flag.serviceId;
//                                         delete flag.flagCode;
//                                         flag.service = service;
//                                     });
//                                     item.flags = flags;
//                                     resolve()
//                                 } else {
//                                     reject()
//                                 }
//                             });
//                         });
//                     }).catch(() => {
//                         reject()
//                     });
//                 }).then(() => {
//                     console.log(tries)
//                     return res.send(tries);
//                 }).catch(() => {
//                     res.statusCode = 500;
//                     return res.send({ error: 'Server error' });
//                 })
//             } else {
//                 res.statusCode = 500;
//                 return res.send({ error: 'Server error' });
//             }
//         });
//     }).catch(() => {
//         res.statusCode = 500;
//         return res.send({ error: 'Server error' });
//     })
// });

// //Get flags
// app.post('/api/flags', (req, res) => {
//     FlagModel.find({ 'tryId': req.body.tryId }, function (err, flags) {
//         if (!err) {
//             flags.forEach(flag => {
//                 delete flag.flagCode;
//             });
//             return res.send(flags);
//         } else {
//             res.statusCode = 500;
//             return res.send({ error: 'Server error' });
//         }
//     });
// });

// //Get services
// app.get('/api/services', (req, res) => {
//     getServices().then((result) => {
//         result.forEach(service => {
//             FlagModel.find({ 'serviceId': service.id }, function (err, flags) {
//                 if (!err) {
//                     flags.forEach(flag => {
//                         TryModel.findOne({ 'id': flag.tryId }, function (err, item) {
//                             if (!err) {
//                                 UserModel.findOne({ 'id': item.userId }, function (err, user) {
//                                     if (!err) {
//                                         delete item.userId;
//                                         delete user.token;
//                                         item.user = user;
//                                     } else {
//                                         res.statusCode = 500;
//                                         return res.send({ error: 'Server error' });
//                                     }
//                                 });
//                                 delete flag.tryId;
//                                 flag.try = item;
//                             } else {
//                                 res.statusCode = 500;
//                                 return res.send({ error: 'Server error' });
//                             }
//                         });
//                     });
//                     service.flags = flags;
//                 } else {
//                     res.statusCode = 500;
//                     return res.send({ error: 'Server error' });
//                 }
//             });
//         });
//         return res.send(result);
//     }).catch(() => {
//         res.statusCode = 500;
//         return res.send({ error: 'Server error' });
//     })
// });



app.listen(config.get('port'), () => {
    log.info('Express server listening on port ' + config.get('port'));
});

//Error handlers
app.use(function(req, res){
    res.status(404);
    log.debug('Not found URL: %s',req.url);
    res.send({ error: 'Not found' });
});
app.use(function(err, req, res){
    res.status(err.status || 500);
    log.error('Internal error(%d): %s',res.statusCode,err.message);
    res.send({ error: err.message });
});
