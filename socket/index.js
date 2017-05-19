var logger = require('logger/log')(module);
var async = require('async');
var cookie = require('cookie');
var sessionStore = require('middleware/sessionStore');//his object has access to sessions DB
var HttpError = require('errors').HttpError;
var User = require('db/models/user').User;

module.exports = function(server) {
    var io = require('socket.io').listen(server);// add socket to application to listen http messages
    io.set('origins', 'localhost:*');//set which domains can access this socketio instance

    io.set('authorization', function(handshake, callback) {//handshake has access to request cookies
        
    });

    io.on('connect', function (socket) {

        socket.on("message", function(text, callback) {
            socket.broadcast.emit("message", text);
            callback();
        })
        
        socket.on('ping', function (data) {
            logger.tata(data);
        });
    });
}