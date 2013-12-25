var mongoose = require('mongoose'),
    Types = mongoose.Schema.Types;

var schema = new mongoose.Schema({

});

var model = module.exports = mongoose.model('home', schema);
model.formage = {
    is_single: true
};
