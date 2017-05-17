var User = require('db/models/user').User;

module.exports = function(req, resp, next) {
    req.user = resp.locals.user = null;
    
    if(!req.session.user) return next();

    User.findById(req.session.user, function(err, user) {
        if(err) return next(err);

        req.user = resp.locals.user = user;//make this object available for all templates
        next();
    })
}