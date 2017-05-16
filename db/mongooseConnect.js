var mongoose = require('mongoose');
var config = require('config');

mongoose.connect(config.get('mongoose:uri'), config.get('mongoose:options'), function(err) {
    if(err) throw err;
});

module.exports = mongoose;