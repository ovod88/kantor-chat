var logger = require('logger/log')(module);
var async = require('async');
var cookie = require('cookie');
var cookieParser = require('cookie-parser');
var config = require('config');
var sessionStore = require('middleware/sessionStore');//his object has access to sessions DB
var HttpError = require('errors').HttpError;
var User = require('db/models/user').User;

var EventEmitter = require("events").EventEmitter;
var ee = new EventEmitter();

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
    if(!session) {
        return callback(null, null);
    }
    if(!session.user) {
        logger.debug('Session %s is anonymous', session.id);
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

    io.use(function(socket, next) {//handshake has access to request cookies
        var handshake = socket.request;
        
        async.waterfall([
            function(callback) {
                handshake.cookies = cookie.parse(handshake.headers.cookie || '');
                var sidCookie = handshake.cookies[config.get('session:key')];
                var sid = cookieParser.signedCookie(sidCookie, config.get('session:secret'));

                loadSession(sid, callback);
            },
            function(session, callback) {
                if(!session) {
                    return callback(new HttpError(403, 'Anonymous user is not allowed'));
                }

                socket.handshake.session = session;
                loadUser(session, callback);
            },
            function(user, callback) {
                if(!user) {
                    return callback(new HttpError(403, 'Anonymous session is not allowed'));
                }
                socket.handshake.user = user;

                callback(null);
            }
        ], function(err) {
            if(!err) {
                console.log('chat authorised');
                return next();//Chat is authorised
            }
            if(err instanceof HttpError) {
                return next(err);//Chat is not authorised
            }

            next(err);//give socket.io to process the error
        });
    });

    io.eeInternal = ee;

    io.eeInternal.on('session:reload', function(sid) {
        var clients = io.sockets.sockets;

        Object.keys(clients).forEach(function(socketId) {
            var client = io.sockets.sockets[socketId];
            if(client.handshake.session.id != sid) return;

             loadSession(sid, function(err, session) {
                if(err) {
                    client.emit('logout', 'server error');
                    client.disconnect();
                    return;
                }
                if(!session) {
                    client.emit('logout', 'handshake anauthorised');
                    client.disconnect();
                    return;
                }

                client.handshake.session = session;
            }) 
        })
    });

    io.on('connect', function (socket) {
        var username = socket.handshake.user.get('username');

        socket.broadcast.emit('join', username);

        socket.on("message", function(text, callback) {
            socket.broadcast.emit("message", username, text);
            callback();
        });
        
        socket.on('ping', function (data) {
            logger.info(data);
        });

        socket.on('disconnect', function() {
            socket.broadcast.emit('leave', username);
        })
    });

    return io;
}