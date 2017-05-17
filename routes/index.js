  // var User = require('db/models/user').User;
  var HttpError = require('errors').HttpError;
  var ObjectID = require('mongodb').ObjectID;

module.exports = function(app) {
  
  app.get('/', require('./principale').get);

  app.get('/login', require('./login').get);

  app.post('/login', require('./login').post);
  app.post('/logout', require('./logout').post);

  app.get('/chat', require('./chat').get);

  // app.get('/users', function(req, resp, next) {
  //   User.find({}, function(err, users) {
  //     if(err) next(500);
  //     resp.json(users);
  //   })
  // });

  // app.get('/user/:id', function(req, resp, next) {
  //   try {
  //     var id = new ObjectID(req.params.id);
  //   } catch (err) {
  //     return next(404);
  //   }

  //   User.findById(id, function(err, user) {
  //     if(err) return next(500);
  //     if(!user) {
  //       next(new HttpError(404, 'User not found'));
  //     }
  //     resp.json(user);
  //   })
  // });
}