var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Types = Schema.Types;

var schema = new Schema({
    navigation: { type: Types.ObjectId, ref: 'navigation' },
    title: { type: String },
    picture: { type: Types.Picture },
    lead: { type: String },
    expert: { type: Types.ObjectId, ref: 'experts' },
    price: { type: Number },
    shipment: { type: Number },
    length: { type: Number },
    details: { type: Types.Html },
    order: { type: Number, editable: false },
    show: { type: Boolean, 'default': true }
});

schema.methods.toString = function(){
    return this.title;
};

var model = module.exports = mongoose.model('products', schema);
model.formage = {
    list: ['navigation', 'title', 'picture', 'expert', 'price', 'show'],
    list_populate: ['navigation', 'expert']
};