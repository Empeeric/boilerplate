var app = require.main.exports.app,
    models = require('../models'),
    dust = require('dustjs-linkedin');

/*
 middle-wares
 */

var config = models.config.middleware(),
    crumbs = models.navigation.crumbs();

/*
 Search for a post with current url:
     res.locals.post
     res.locals.page
 if not than a navigation item:
     res.locals.page
 */
var getByUrl = function(req, res, next) {
    var params = req.params[0];

    models.navigation.findOne()
        .where('url', params)
        .where('show', true)
        .lean()
        .exec(function (err, page) {
            if (err) return next(err);

            if (page) {
                res.locals.page = page;
                return next();
            }

            models.posts.findOne()
                .where('url', params)
                .where('show', true)
                .populate('navigation')
                .lean()
                .exec(function (err, post) {
                    if (err) return next(err);

                    if (post) {
                        res.locals.page = post.navigation;
                        res.locals.post = post;
                    }

                    return next();
                });
        });
};

// CMS rule
app.get('*', [ config, getByUrl, crumbs ], function (req, res, next) {
    if (!res.locals.page)
        return next();

    res.render(res.locals.page.template || 'index');
});

app.use(config);
app.use(function (req, res) {
    if (req.config) {
        res.locals.page = { title: req.config._404.title};
        res.locals.config = req.config;
    }

    res.status(404).render('404');
});