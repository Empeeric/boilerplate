var registry = require('./global'),
    app = require.main.exports.app,
    models = require('./models'),
    mail = require('nodemailer').createTransport('SMTP', {
        service: "SendGrid",
        auth: registry.SENDGRID_AUTH
    }),
    config = models.config.middleware();

app.get('/w', function() {

});

/*
app.post('/thank-you', config, function (req, res) {
    var message = {
        from:,
        to:,
        subject:,
        html:
    };

    mail.sendMail(message, function (err, response) {
        res.json({ success: !err });
    })
});
*/