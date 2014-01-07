var _ = require('lodash'),
    mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Types = Schema.Types,
    async = require('async'),
    views = require('../../front/views/');


var schema = new Schema({
    parent: { type: Types.ObjectId, ref: 'navigation' },
    meta: [{
        name: { type: String },
        content: { type: Types.Text }
    }],
    title: { type: String, required: true, trim: true },
    url: { type: String, trim: true, lowercase: true, unique: true },
    template: { type: String, enum: views, default: 'index' },
    order: { type: Number, editable: false },
    menu: { type: Boolean, 'default': true },
    show: { type: Boolean, 'default': true }
});

schema.methods.toString = function(){
    return this.title;
};

schema.statics.findRecursive = function(cb) {
    this.find({ show: true, menu: true })
        .select('order parent url title')
        .sort({ parent: -1, order: 1 })
        .lean()
        .exec(function(err, items) {
            if (err) cb(err);

            var o = {};
            items.forEach(function(item) {
                item.sub = {items: []};
                o[item._id] = item;
            });
            for (var i in o) {
                var item = o[i];
                if (item.parent) {
                    o[item.parent] && o[item.parent].sub.items.push(item);
                    delete o[i];
                }
            }
            cb(null, _.values(o));
        });
};

/*
    Find crumbs of current page,
    assumed to be at `res.locals.page`
    results at
        `res.locals.crumbs`
 */
schema.statics.crumbs = function() {
    var nav = this;

    return function(req, res, next) {
        var crumbs = [];

        var parent = function(id) {
            nav.findById(id)
                .select('parent url title')
                .lean()
                .exec(function(err, page) {
                    if (err) return next(err);
                    if (page) {
                        crumbs.push(page);
                        return parent(page.parent);
                    }
                    crumbs[0].last = true;
                    res.locals.crumbs = crumbs.reverse();
                    next();
                });
        };
        if (res.locals.post) {
            crumbs.push(res.locals.post);
        }
        if (res.locals.page) {
            crumbs.push(res.locals.page);
            parent(res.locals.page.parent);
        }
        else next();
    }
};

schema.pre('validate', function(next) {
    var url = this.url;

    if (!url)
        url = '/' + this.title;

    url = url.replace(/[\?\'\"\@\!\#\$\%\^\&\*\(\)\+\=\_\~\{\}\[\]\\\|\,\;\:]/g, "")
        .replace(/ +/g, "-")
        .replace(/\-+/g, '-')
        .replace(/(?:^\-|\-$)/g, '');

    if (url.substr(0,1) !== '/')
        url = '/' + url;

    this.url = url.toLowerCase();

    next();
});

schema.path('url').validate(function(v, callback){
    var self = this;
    async.each(['posts', 'navigation'], function(item, cb){
        var query = self.db.model(item).findOne().where('url', self.url);

        if('navigation' == item) query.ne('_id', self._id);

        query.exec(function(err, url){
            cb(err || url);
        });

    }, function(err){
        callback(!err);
    });
}, 'url already exists');

schema.formage = {
    list: ['title', 'parent', 'url', 'menu', 'show']
};

var model = module.exports = mongoose.model('navigation', schema);