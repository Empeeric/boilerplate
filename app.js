var nodestrum = require('nodestrum');
var express = require('express'),
    path = require('path');

// http://www.forbes.com/sites/daviddisalvo/2012/04/01/what-eating-too-much-sugar-does-to-your-brain/
require('sugar');

nodestrum.register_process_catcher();

var app = module.exports.app = express();

// all environments
app.set('port', process.env.PORT || 80);
app.set('mongo', process.env.MONGOLAB_URI || 'mongodb://localhost/mpy');
app.set('sendgrid', { user: process.env.SENDGRID_USERNAME, key: process.env.SENDGRID_PASSWORD });
process.env.CLOUDINARY_URL || (process.env.CLOUDINARY_URL = '');
app.set('admin', {username: 'admin', password: process.env.ADMIN_PASSWORD || 'admin' });
app.set('site', 'My Preference Yeild');

app.engine('dust', require('consolidate').dust);
app.set('view engine', 'dust');
app.set('views', path.join(__dirname, 'views'));

app.use(nodestrum.domain_wrapper_middleware);

app.use(express.favicon());
app.use(express.compress());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('mpy secret cookie'));
app.use(express.cookieSession({cookie: { maxAge: (20).minutes() }}));

app.use(function (req, res, next) {
    // force ie to use latest render engine
    // prevent compatibility mode
    res.header('X-UA-Compatible', 'IE=edge');
    next();
});

app.use(express.static(path.join(__dirname, 'public')));

require('formage').init(app, express, require('./models'), {
    title: app.get('site') + ' Admin',
    password: app.get('admin').password,
    default_section: 'Cms'
});

app.use(app.router);

app.use(function (req, res, next) {
    res.locals.page = { title: req.config._404.title};
    res.locals.config = req.config;

    res.status(404).render('404');
});

app.use(express.errorHandler());

// development only
if ('development' == app.get('env')) {
    require('dustjs-linkedin').optimizers.format = function(ctx, node) { return node };
}

require('mongoose').connect(app.get('mongo'));

require('./dust/helpers');
require('./dust/filters');
require('./mongoose/helpers');
require('./routes');

require('http').createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
