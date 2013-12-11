var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Types = Schema.Types;

var schema = new Schema({
    route: { type: String, required: true },
    redirect: { type: String, required: true },
    status: { type: Number, enum: [301, 302], default: 301 }
});

var model = module.exports = mongoose.model('redirect', schema);
model.formage = { section: 'Configuration' };
