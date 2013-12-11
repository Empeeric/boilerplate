var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Types = Schema.Types;

var schema = new Schema({
    pictures: [{picture: Types.Picture}],
    title: Types.Picture,
    text: Types.Text
});

schema.methods.toString = function(){
    return this.title;
};

var model = module.exports = mongoose.model('banners', schema);
model.formage = { section: 'Configuration', is_single: true };