var app = require.main.exports.app,
    models = require('../models'),
    mail = require('../mail'),
    config = models.config.middleware();

app.post('/thank-you', config, function (req, res) {
    var message = {
        from: req.body.email,
        to: res.locals.config.email,
        subject: req.body.subject,
        html: req.body.subject
    };

    mail.sendMail(message, function (err, response) {
        res.json({ success: !err });
    })
});