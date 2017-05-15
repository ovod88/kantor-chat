module.exports = function(req, resp, next) {

    resp.sendHttpError = function(error) {
        resp.status(error.status);

        if(resp.req.headers['x-requested-with'] == 'XMLHttpRequest') {
            resp.json(error);
        } else {
            resp.render('error', {error: error});
        }
    }

    next();
}