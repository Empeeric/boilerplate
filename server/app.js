var registry = require('./global');

var nodestrum = require('nodestrum'),
    express = require('express'),
    path = require('path'),
    mongoose = require('mongoose'),
    formage = require('formage'),
    models = require('./models'),
    http = require('http'),
    dust = require('dustjs-linkedin'),
    consolidate = require('consolidate');
//    resors = require('resors');

// baaaaahhh
//require('sugar');

nodestrum.register_process_catcher();

var app = module.exports.app = express();

app.set('site', 'Empeeric Boilerplate');
app.engine('dust', consolidate.dust);
app.set('view engine', 'dust');
app.set('views', path.join(__dirname, '..', 'front', 'views'));

app.use(nodestrum.domain_wrapper_middleware);
app.use(express.compress());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser(registry.COOKIE_SECRET));
app.use(express.cookieSession({cookie: { maxAge: 14 * 24 * 60 * 60 * 1000 }}));

app.use(function (req, res, next) {
    // force ie to use latest render engine
    // prevent compatibility mode
    res.header('X-UA-Compatible', 'IE=edge');
    next();
});

app.use(express.static(path.join(__dirname, '..', 'public')));

formage.init(app, express, models, {
    title: app.get('site') + ' Admin',
    default_section: 'CMS'
});


/*
 uncomment when needed
 */
//app.use('/api', resors.middleware(models));
//require('./passport')
//require('./routes/users');

app.use(app.router);

// development only
if (nodestrum.isDebug('templates')) {
    app.use(express.errorHandler());
    dust.optimizers.format = function(ctx, node) { return node };
}

mongoose.connect(registry.mongo_cfg);

//require('../front/compile_templates');
require('../front/dust/helpers');
require('../front/dust/filters');
require('./mongoose/helpers');
require('./routes/cms');
require('./routes');

var server = registry.server = http.createServer(app);
//require('./sockets')(server, models.users, cookieParser);

server.listen(registry.PORT, function(){
    console.log("Server listening on %s", server._connectionKey);
});
