exports.post = function(req, resp, next) {
    var sid = req.session.id;

    var io = req.app.settings.io;

    req.session.destroy(function(err) {
        io.eeInternal.emit('session:reload', sid);//it goes before err checking to launch session reload in any case        
        
        if(err) return next(err);
        resp.redirect('/');
    });
}