var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Types = Schema.Types;

var schema = new Schema({
    banner: Types.Picture,
    logo: Types.Picture,
    icon: Types.Picture,
    homepage: String,
    site_name: String,
    copyrights: String,
    contact: {
        title: String,
        text: Types.Html,
        pobox: String,
        phone: String,
        email: String
    },
    phone_prefix: {
        land: [String],
        mobile: [String]
    },
    snippets: [Types.Text],
    _404: {
        title: String,
        content: Types.Html
    }
});

/*
    Return site config and some other:
        res.locals.config
        res.locals.http_params
 */
schema.statics.middleware = function() {
    var config = this;
    return function(req, res, next) {
        config.findOne().lean().exec(function(err, config) {

            res.locals.http_params = {
                query: req.query,
                headers: req.headers,
                body: req.body,
                url: req.url,
                debug: req.app.get('env') == 'development'
            };

            res.locals.config = config || {
                title: req.app.get('site')
            };
            next(err);
        });
    }
};

schema.formage = {
    section: 'Configuration',
    is_single: true
};

var model = module.exports = mongoose.model('config', schema);