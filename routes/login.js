var User = require('db/models/user').User;
var async = require('async');
var HttpError = require('errors').HttpError;
var AuthError = require('db/models/user').AuthError;

exports.get = function(req, resp) {
    resp.render('login');
}


exports.post = function(req, resp, next) {
    var username = req.body.username;
    var password = req.body.password;

    User.authenticate(username, password, function(err, user) {
        if(err) {
            if(err instanceof AuthError) {
                return next(new HttpError(403, err.message));
            } else {
                return next(err);
            }
        }

        req.session.user = user._id; 
        resp.send({});
    })
}