var mongoose = require('mongoose'),
    Types = mongoose.Schema.Types,
    views = require('../../front/views/');

var schema = new mongoose.Schema({
    mame: {type: String, enum: views, default: 'index'},
    models: [{ type: Types.ObjectId, ref: 'models' }]
});

schema.methods.toString = function(){
    return this.mame;
};

schema.formage = {
    list: ['name']
};

var model = module.exports = mongoose.model('templates', schema);
