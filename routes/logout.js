exports.post = function(req, resp) {
    req.session.destroy();
    resp.redirect('/');
}