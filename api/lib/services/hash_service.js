const config     = require('../../config/config');
const md5 = require('md5');
const UserModel  = require('../../config/db').UserModel;
const crypto  = require('crypto');

class HashService{
    constructor(){}

    getHash(string){
        let newString = string + config.get('localSalt') ;
        return md5(newString);
    }

    compareWithHash(string, hash){
        let newString = string + config.get('localSalt') ;
        return md5(newString) === hash;
    }

    createGuidString() {
        return crypto.randomBytes(64).toString('hex');
    }

    getUserIdByToken(token) {
        UserModel.findOne({ 'token': token }, (err, user) => {
            if (!err) {
                return user.id;
            } else {
                return null;
            }
        });
    }
}

let hashService = new HashService();

module.exports.HashService = hashService;