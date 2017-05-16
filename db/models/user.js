var crypto = require('crypto');
var async = require('async');
var mongoose = require('../mongooseConnect'),
    Schema = mongoose.Schema;

var schemaUser = new Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },
    hashedPassword: {
        type: String,
        required: true
    },
    salt: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date,
        default: Date.now
    }
});

schemaUser.methods.cryptoPassword = function(password) {
    return crypto.createHmac('sha256', this.salt).update(password).digest('hex');
}

schemaUser.virtual('password')
    .set(function(password) {
        this._plainPassword = password;
        this.salt = Math.random() + '';
        this.hashedPassword = this.cryptoPassword(password);
    })
    .get(function() { return this._plainPassword; });

schemaUser.methods.checkPassword = function(password) {
    return this.cryptoPassword(password) === this.hashedPassword;
}

schemaUser.statics.authenticate = function(username, password, callback) {
        var User = this;

        async.waterfall([
            function(callback) {
                User.findOne({username: username}, callback);
            }, 
            function(user, callback) {
                if(user) {
                    if(user.checkPassword(password)) {
                        callback(null, user);
                    } else {
                        callback(new AuthError('Password incorrect'));
                    }
                } else {
                    var user = new User({username: username, password: password});
                    user.save(function(err) {
                        if(err) return callback(err);
                        callback(null, user);
                    })
                }
            }], callback)
}

exports.User = mongoose.model('User', schemaUser);

function AuthError(message) {
    Error.apply(this, arguments);
    Error.captureStackTrace(this, HttpError);

    this.message = message;
}

util.inherits(AuthError, Error);

AuthError.prototype.name = "AuthError";
exports.AuthError = AuthError;