var winston = require('winston');
var ENV = process.env.NODE_ENV || 'development';
var path = require('path');

function getLogger(module) {
    var fullPath = module.filename.split(path.sep).slice(-2).join(path.sep);

    return new (winston.Logger)({
        transports: [
            new (winston.transports.Console)({
                colorize: true,
                level: (ENV == 'development') ? 'debug' : 'error',//which levels to output
                label: fullPath
            })
        ]
    });
}

module.exports = getLogger;