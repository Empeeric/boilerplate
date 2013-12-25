var mongoose = require('mongoose'),
    Types = mongoose.Schema.Types,
    models = require('./'),
    views = require('../../front/views/');


var schema = new mongoose.Schema({
    mame: { type: String, enum: views, default: 'index' },
    models: [{
        name: { type: String, enum: Object.keys(models) },
        options: {
            limit: Number,
            paginate: { type: Boolean, default: false },
            navigation: { type: Boolean, default: true },
            sort: [{
                key: String,
                value: { type: String, enum: ['asc', 'desc'] }
            }],
            where: [{
                key: String,
                value: Types.Mixed
            }],
            populate: [String]
        }
    }]
});

schema.methods.toString = function(){
    return this.mame;
};

schema.formage = {
    list: ['mame', 'models']
};

var model = module.exports = mongoose.model('templates', schema);
