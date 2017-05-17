var HttpError = require('errors').HttpError;

module.exports = function(req, resp, next) {
  if(!req.session.user) {
      return next(new HttpError(401, 'You are not authenticated'));
  }

  next();  
};