var registry = require('./global'),
    mailer = require('nodemailer');

module.exports = mailer.createTransport('SMTP', {
    service: "SendGrid",
    auth: registry.SENDGRID_AUTH
});