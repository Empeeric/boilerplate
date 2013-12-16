var registry = require('./global');
var app = require.main.exports.app,
    models = require('./models'),
    dust = require('dustjs-linkedin'),
    mail = require('nodemailer').createTransport('SMTP', {service: "SendGrid", auth: registry.SENDGRID_AUTH});

/*
 middle-wares
 */

var config = function (req, res, next) {
    models
        .config
        .findOne()
        .lean()
        .exec(function (err, config) {
            req.config = config;
            next(err);
        })
};


var page = function (req, res, next) {
    var params = req.params[0];

    models
        .posts
        .findOne()
        .where('url', params)
        .where('show', true)
        .populate('navigation')
        .lean()
        .exec(function (err, posts) {
            if (posts && posts.navigation) {
                req.page = posts.navigation;
                req.posts = posts;
                next(err);
            } else {
                models
                    .navigation
                    .findOne()
                    .where('url', params)
                    .where('show', true)
                    .lean()
                    .exec(function (err, page) {
                        if (page && page.text) {
                            dust.loadSource(dust.compile(page.text, "posts_template"));
                            dust.render('posts_template', req.config, function (err, text) {
                                page.text = text;
                            });
                        }
                        req.page = page;
                        next(err);
                    })
            }
        })
};

var crumbs = function (req, res, next) {
    var crumbs = [];

    var parent = function (id) {
        models
            .navigation
            .findOne()
            .where('_id', id)
            .lean()
            .exec(function (err, page) {
                if (page) {
                    crumbs.push(page);
                    parent(page.parent);
                } else {
                    req.crumbs = crumbs.reverse();
                    next(err)
                }

            })
    };

    if (req.page) {
        crumbs.push(req.page);
        parent(req.page.parent);
    }
    else next();
};

var posts = function (req, res, next) {
    var posts = req.posts;
    if (posts) {
        req.crumbs.push({title: posts.title, url: posts.url});
        if (posts.text) {
            dust.loadSource(dust.compile(posts.text, "posts_template"));
            dust.render('posts_template', req.config, function (err, text) {
                posts.text = text;
            });
        }
    }
    next();
};

var product = function (req, res, next) {
    if (req.query.product) {
        models
            .products
            .findOne()
            .where('_id', req.query.product)
            .populate('expert')
            .lean()
            .exec(function (err, result) {
                models.expertise.findById(result.expert.expertise, function (err, expertise) {
                    req.crumbs.push({title: result.title, url: req.page.url + '?product=' + result._id});
                    result.expert.expertise = expertise;
                    res.locals.product = result;
                    next();
                });

            })
    } else next();
};


// cms rules
app.get('*', [config, page, crumbs, posts, product], function (req, res, next) {
    if (!req.page)
        return next();

    res.locals.page = req.page;
    res.locals.page.query = req.query;
    res.locals.page.full_url = 'http://' + req.headers.host + req.url;

    res.locals.config = req.config || {};
    res.locals.crumbs = req.crumbs || [];
    res.locals.crumbs.forEach(function (crumb, i) {
        crumb.last = i == res.locals.crumbs.length - 1;
    });

    res.locals.posts = req.posts || null;

    res.locals.development = (app.get('env') == "development");
    res.render(req.page.template);
});


app.post('/thank-you', config, function (req, res) {
    /*var message = {
     from: ,
     to: ,
     subject: ,
     html:
     };

     mail.sendMail(message, function(err, response) {
     res.json({success: !err});
     })*/
});

app.use(config);
