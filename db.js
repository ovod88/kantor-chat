var User = require('./db/models/user').User;

var newUser = new User({
    username: "vova",
    password: 'secret'
});

User.remove(function(err, affected){
    if(err) throw err;
    console.log(arguments);
})

newUser.save(function(err, user, affected) {
    if(err) throw err;
    User.findOne({username: 'vova'}, function(err, user) {
        console.log(user);
    })
});