var mongoose = require('mongoose'),
    Types = mongoose.Schema.Types,
    models = require('./');


var schema = new mongoose.Schema({
    title: String,
    pictures: [{type: Types.Filepicker, widget: 'FilepickerPictureWidget' }]
});

schema.methods.toString = function(){
    return this.mame;
};

schema.formage = {
    list: ['title']
};

module.exports = schema;
