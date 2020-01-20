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
const hoursFromLastLab = config.get('hoursFromLastLab');
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
            if(response.services){
                response.services.forEach(service => {
                    service.flag.forEach(flag => {flag.serviceName = service.name; flags.push(flag)});
                });
                const result = {
                    labId: response.id,
                    flags: flags
                };
                resolve(result);
            }else{
                reject("All services are busy");
            }
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
            UserModel.findOne({ 'name': req.body.name }, (err, user) => {
                if (!err) {
                    if(user){
                        res.statusCode = 500;
                        res.send({error: 'Name was used'});
                    }else {
                        user = new UserModel({
                            name: req.body.name,
                            password: HashService.getHash(req.body.password),
                            inviteId: invite._id,
                        });
                        InviteModel.update(
                            {_id: invite._id},
                            {$set: {'status': "used"}},
                            function (err) {
                                if (!err) {
                                    user.save(function (err) {
                                        if (!err) {
                                            return res.send({status: 'OK'});
                                        } else {
                                            res.statusCode = 500;
                                            res.send({error: 'Server error'});
                                        }
                                    });
                                } else {
                                    res.statusCode = 500;
                                    return res.send({error: 'Server error'});
                                }
                            }
                        );
                    }
                } else {
                    res.statusCode = 500;
                    res.send({error: 'Server error'});
                }
            });
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
            if(user && HashService.compareWithHash(req.body.password, user.password)){
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
    FlagModel.find({}, function (err, flags) {
        if (!err) {
            flags = flags.map(flag => {
                return {
                    tryId: flag.tryId,
                    serviceName: flag.serviceName,
                    flagType: flag.flagType,
                    submitTime: flag.submitTime,
                    flagStatus: flag.flagStatus
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
            if(user) {
                return res.send({_id: user._id, name: user.name});
            }else{
                res.statusCode = 500;
                return res.send({error: 'LogIn error'});
            }
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
        TryModel.findOne({'userId': user._id}, {}, { sort: { 'startTime' : -1 } }, (err, item) => {
            if (!err) {
                let canCreateLab = false;
                let labIsActive = false;
                if(item){
                    let finishTimeDate = moment(item.finishTime);
                    let now = moment();
                    labIsActive = now < finishTimeDate;
                    if(!labIsActive && now > finishTimeDate.add(hoursFromLastLab, 'hours')){
                        canCreateLab = true;
                    }
                }else{
                    canCreateLab = true;
                }

                if(canCreateLab){
                    getLab().then((result) => {
                        //Создаем лабу
                        let now = moment();
                        let finishTime = moment().add(hoursFromLastLab, 'hours');
                        let newTry = new TryModel({
                            userId: user._id,
                            userName: user.name,
                            tryName: req.body.tryName,
                            startTime: now,
                            finishTime: finishTime,
                            labId: result.labId
                        });
                        newTry.save((err, item) => {
                            saveLab(result.labId, item._id).then(() => {
                                result.flags.forEach(flag => {
                                    let newFlag = new FlagModel({
                                        flagCode: flag.flag_code,
                                        flagType: flag.flag_type,
                                        flagStatus: "unsolved",
                                        tryId: item._id,
                                        serviceName: flag.serviceName,
                                    });
                                    newFlag.save(() => {});
                                });
                                return res.send({status: 'OK'});
                            }).catch(() => {
                                res.statusCode = 500;
                                return res.send({ error: 'Server error' });
                            });
                        });
                    }).catch((error) => {
                        res.statusCode = 500;
                        return res.send({ error: error ? error : 'Server error' });
                    });

                }else if(labIsActive){
                    //Отдаем текущий конфиг
                    getVPNConfig(item.labId).then(response => {
                        res.set({
                            'Content-Disposition': 'attachment; filename="config.ovpn"',
                            'Content-type': 'application/octet-stream'
                        });
                        // const file = new Blob(response.body, {type: 'plain/text'});
                        res.type('application/octet-stream');
                        res.send(Buffer.from(response.body));
                    });
                    // return res.send("vpnConfig Active laba");
                    // res.contentType('text/plain');
                    // res.send('This is the content', { 'Content-Disposition': 'attachment; filename=config.ovpn' });
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
    FlagModel.findOneAndUpdate({ 'flagCode': req.body.flagCode }, {flagStatus: "solved", submitTime: new Date()}, (err, flag) => {
        if (!err) {
            if(flag) {
                return res.send({status: 'OK'});
            }else{
                res.statusCode = 500;
                return res.send({ error: 'Incorrect flag' });
            }
        } else {
            res.statusCode = 500;
            return res.send({error: 'Server error'});
        }
    });
});

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
