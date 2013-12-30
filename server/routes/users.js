var passport = require('passport'),
    pw = require('password-hash'),
    models = require('../models'),
    app = require.main.exports.app,
    config = models.config.middleware();

app.get('/login', config, function(req, res) {
    res.render('login', {
        page: {
            title: 'login',
            error: req.session.messages
        }
    });
});
app.post('/login', passport.authenticate('local',{
    successRedirect: '/profile',
    failureRedirect: 'login',
    failureMessage: true
}));
app.post('/register', function(req, res){
    var user = new models.users({
        email: req.body.email,
        password: pw.generate(req.body.password)
    });
    user.save(function (err, user) {
        if (err) {
            return res.render('login', {
                page: { title: 'Login' },
                error: 'The email you specified is already in use. Please sign up with a different email account.'
            });
        }
        req.login(user, function(err) {
            if (err) {
                return res.render('login', {
                    page: { title: 'Login' },
                    error: 'An error occurred.'
                });
            }
            return res.redirect('/profile');
        })
    });
});

app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
});

app.get(function(req, res, next) {
    if (req.isAuthenticated())
        res.locals.user = req.user;

    next();
});