var mongoose = require('mongoose'),
    Types = mongoose.Schema.Types,
    models = require('./');


var schema = new mongoose.Schema({
    gallery: { type: Types.ObjectId, ref: 'gallery' },
    posts: { type: Types.ObjectId, ref: 'posts' }
});

module.exports = schema;
