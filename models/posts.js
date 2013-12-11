var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Types = Schema.Types,
    async = require('async');

var schema = new Schema({
    navigation: { type: Types.ObjectId, ref: 'navigation' },
    title: { type: String },
    picture: { type: Types.Picture },
    text: { type: Types.Html },
    url: { type: String, trim: true, lowercase: true },
    order: { type: Number, editable: false },
    show: { type: Boolean, 'default': true }
});

schema.methods.toString = function(){
    return this.title;
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

        if('posts' == item) query.ne('_id', self._id);

        query.exec(function(err, url){
            cb(err || url);
        });

    }, function(err){
        callback(!err);
    });
}, 'url already exists');

var model = module.exports = mongoose.model('posts', schema);
model.formage = {
    list: ['navigation', 'title', 'picture', 'show']
};
