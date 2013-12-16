var _ = require('lodash'),
    mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Types = Schema.Types,
    async = require('async'),
    views = require('../../frontend/views/');


var schema = new Schema({
    parent: { type: Types.ObjectId, ref: 'navigation' },
    meta: [{
        name: { type: String },
        content: { type: Types.Text }
    }],
    title: { type: String, required: true, trim: true },
    url: { type: String, trim: true, lowercase: true, unique: true },
    template: { type: String, enum: views, default: 'homepage' },
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

var model = module.exports = mongoose.model('navigation', schema);
model.formage = {
    list: ['title', 'parent', 'url', 'menu', 'show']
};
