var logger = require('logger/log')(module);

module.exports = function(server) {
    var io = require('socket.io').listen(server);// add socket to application to listen http messages
    io.set('origins', 'localhost:*');//set which domains can access this socketio instance

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