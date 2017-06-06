var logger = require('logger/log')(module);
var async = require('async');
var cookie = require('cookie');
var cookieParser = require('cookie-parser');
var config = require('config');
var sessionStore = require('middleware/sessionStore');//his object has access to sessions DB
var HttpError = require('errors').HttpError;
var User = require('db/models/user').User;


function loadSession(sessionId, callback) {//Transform sessionStore load return values to async compatible view
    sessionStore.load(sessionId, function(err, session) {
        if(arguments.length == 0) {
            return callback(null, null);
        } else {
            return callback(null, session);
        }
    });
}

function loadUser(session, callback) {
    if(!session.user) {
        logger.debug('Sessios %s is anonymous', session.id);
        return callback(null, null);
    }

    logger.debug('Getting user ', session.user);

    User.findById(session.user, function(err, user) {
        if(err) return callback(err);

        if(!user) {
            return callback(null, null);
        }

        logger.debug('received user ', user);
        
        callback(null, user);
    })
    
}


module.exports = function(server) {
    var io = require('socket.io').listen(server);// add socket to application to listen http messages
    io.set('origins', 'localhost:*');//set which domains can access this socketio instance

    io.set('authorization', function(handshake, callbackMain) {//handshake has access to request cookies
        async.waterfall([
            function(callback) {
                handshake.cookies = cookie.parse(handshake.headers.cookie || '');
                var sidCookie = handshake.cookies[config.get('session:key')];
                var sid = cookieParser.signedCookie(sidCookie, config.get('session:secret'));

                loadSession(sid, callback);
            },
            function(session, callback) {
                if(!session) {
                    callback(new HttpError(403, 'Anonymous user is not allowed'));
                }

                handshake.session = session;
                loadUser(session, callback);
            },
            function(user, callback) {
                if(!user) {
                    callback(new HttpError(403, 'Anonymous session is not allowed'));
                }
                handshake.user = user;
                callback(null);
            }
        ], function(err) {
            if(!err) {
                return callbackMain(null, true);//Chat is authorised
            }
            if(err instanceof HttpError) {
                return callbackMain(null, false);//Chat is not authorised
            }

            callbackMain(err);//give socket.io to process the error
        });
    });

    io.on('connect', function (socket) {
        var username = socket.handshake.user.get('username');

        socket.broadcast.emit('join', username);

        socket.on("message", function(text, callback) {
            socket.broadcast.emit("message", username, text);
            callback();
        })
        
        socket.on('ping', function (data) {
            logger.info(data);
        });

        socket.on('disconnect', function() {
            socket.broadcast.emit('leave', username);
        })
    });
}