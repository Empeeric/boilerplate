var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Types = Schema.Types;

var schema = new Schema({
    banner: Types.Picture,
    logo: Types.Picture,
    icon: Types.Picture,
    homepage: String,
    site_name: String,
    copyrights: String,
    contact: {
        title: String,
        text: Types.Html,
        pobox: String,
        phone: String,
        email: String
    },
    phone_prefix: {
        land: [String],
        mobile: [String]
    },
    snippets: [Types.Text],
    _404: {
        title: String,
        content: Types.Html
    }
});

var model = module.exports = mongoose.model('config', schema);
model.formage = { section: 'Configuration', is_single: true };
