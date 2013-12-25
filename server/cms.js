var registry = require('./global'),
    app = require.main.exports.app,
    models = require('./models'),
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

    models.posts.findOne()
        .where('url', params)
        .where('show', true)
        .populate('navigation')
        .lean()
        .exec(function (err, post) {
            if (err) return next(err);

            if (post && post.navigation) {
                res.locals.page = post.navigation;
                res.locals.post = post;
                return next(err);
            }

            models.navigation
                .findOne()
                .where('url', params)
                .where('show', true)
                .lean()
                .exec(function (err, page) {
                    if (page && page.text) {
                        dust.loadSource(dust.compile(page.text, 'posts_template'));
                        dust.render('posts_template', req.config, function (err, text) {
                            page.text = text;
                        });
                    }
                    res.locals.page = page;
                    next(err);
                });
        });
};


// CMS rule
app.get('*', [ config, getByUrl, crumbs ], function (req, res, next) {
    if (!res.locals.page)
        return next();

//    res.json({
//        page: res.locals.page
//    });

    res.render(res.locals.page.template || 'index');
});

app.use(config);