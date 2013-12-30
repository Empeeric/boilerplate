// npm i --save passport passport-local password-hash

var passport = require('passport'),
    models = require('./models'),
    pw = require('password-hash'),
    LocalStrategy = require('passport-local').Strategy;

// LocalStrategy: check user against the database
passport.use(new LocalStrategy(
    {
        usernameField: 'email',
        passwordField: 'password'
    },
    function (email, password, cb) {
        models.users.findOne({ email: email, active: true }, function (err, user) {
            if (err) return cb(err);
            if (!user || !pw.verify(user.password, password))
                return cb(null, false, { message: 'Incorrect username or password.' });
            return cb(null, user);
        });
    }
));

passport.serializeUser(function (user, cb) {
    cb(null, user._id);
});
passport.deserializeUser(function (id, cb) {
    models.users.findById(id, cb);
});

module.exports = function (app) {
    app.use(passport.initialize());
    app.use(passport.session());
};