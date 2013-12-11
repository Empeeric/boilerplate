var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Types = Schema.Types;

var schema = new Schema({
    name: { type: String },
    description: { type: Types.Text },
    expertise: { type: Types.ObjectId, ref: 'expertise' }
});

schema.methods.toString = function(){
    return this.title;
};

schema.methods.toString = function(){
    return this.name;
};

var model = module.exports = mongoose.model('experts', schema);
model.formage = {
    list: ['name', 'description', 'expertise'],
    list_populate: ['expertise'],
    order_by: ['name']
};