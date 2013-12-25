var mongoose = require('mongoose'),
    Types = mongoose.Schema.Types;

var schema = new mongoose.Schema({

});

schema.formage = {
    is_single: true
};

var model = module.exports = mongoose.model('home', schema);

