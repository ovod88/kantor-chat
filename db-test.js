var mongoose = require('./db/mongoose');
mongoose.set('debug', true);
var async = require('async');

async.series([
    open,
    dropDatabase,
    requireModels,
    createUsers
], function(err) {
    mongoose.disconnect();
    console.log(arguments);
    process.exit(err ? 255 : 0);
})

function open(callback) {
    mongoose.connection.on('open',callback);
}

function dropDatabase(callback) {
    var db = mongoose.connection.db;//Call mongo native driver db object. Native driver can not cache mongoose requests!!!
    db.dropDatabase(callback);//Only native driver can drop the database!!!This call is run right away when mongoose didnt connect to DB
    //This function is not logged by debug mongoose because this function is not mongoose but native driver
}

function requireModels(callback) {
    require('./db/models/user');//add model to mongoose of User. we need it here so mongoose create unigue index for username

    async.each(Object.keys(mongoose.models), function(moduleName, callback) {
        mongoose.models[moduleName].ensureIndexes(callback);
    }, callback);
}

function createUsers(callback) {
    var users = [
        {username: 'Vasya', password: '12345'},
        {username: 'Petia', password: '12345'},
        {username: 'Kolia', password: '12345'}
    ];

    async.each(users, function(userData, callback) {
        var user = new mongoose.models.User(userData);
        user.save(callback);
    }, callback);
}