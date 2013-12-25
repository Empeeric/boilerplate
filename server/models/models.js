var mongoose = require('mongoose'),
    Types = mongoose.Schema.Types;

var schema = new mongoose.Schema({
    mame: String,
    conditions: Object
});

schema.methods.toString = function(){
    return this.mame;
};

schema.formage = {
    list: ['name']
};

var model = module.exports = mongoose.model('models', schema);
