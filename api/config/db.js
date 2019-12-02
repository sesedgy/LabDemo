let mongoose    = require('mongoose');
let log         = require('./log')(module);
let config      = require('./config');

mongoose.Promise = global.Promise;
let options = {
    useMongoClient: true,
    reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
    reconnectInterval: 500, // Reconnect every 500ms
    poolSize: 10, // Maintain up to 10 socket connections
    // If not connected, return errors immediately rather than waiting for reconnect
    bufferMaxEntries: 0
};
mongoose.connect(config.get('db:url'), options);
let db = mongoose.connection;

db.on('error', function (err) {
    log.error('connection error:', err.message);
});
db.once('open', function callback () {
    log.info("Connected to DB!");
});

let Schema = mongoose.Schema;

// Schemas
let User = new Schema({
    id: Schema.Types.ObjectId,
    name: String,
    password: String,
    inviteId: String,
    token: String
});
let Invite = new Schema({
    id: Schema.Types.ObjectId,
    inviteCode: String,
    status: String,
});
let Flag = new Schema({
    id: Schema.Types.ObjectId,
    flagCode: String,
    flagType: String,
    flagStatus: String,
    serviceName: String,
    tryId: String,
    submitTime: {type: Date},
});
let Try = new Schema({
    id: Schema.Types.ObjectId,
    userId: String,
    userName: String,
    tryName: String,
    labId: String,
    startTime: {type: Date},
    finishTime: {type: Date},
});

let UserModel = mongoose.model('User', User);
let InviteModel = mongoose.model('Invite', Invite);
let FlagModel = mongoose.model('Flag', Flag);
let TryModel = mongoose.model('Try', Try);

module.exports.UserModel = UserModel;
module.exports.InviteModel = InviteModel;
module.exports.FlagModel = FlagModel;
module.exports.TryModel = TryModel;