var crypto = require('crypto');

var mongoose = require('../mongoose'),
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

exports.User = mongoose.model('User', schemaUser);