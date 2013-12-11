var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Types = Schema.Types;

var schema = new Schema({
    name: { type: String }
});

schema.methods.toString = function(){
    return this.title;
};

schema.methods.toString = function(){
    return this.name;
};

var model = module.exports = mongoose.model('expertise', schema);
model.formage = {
    list: ['name'],
    order_by: ['name']
};