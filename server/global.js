"use strict";

function createConfiguration(appName) {
    return module.exports = global.registry = {
        APP_NAME: appName,
        PORT: process.env.PORT || 80,
        FAKE_SOCKET: {
            emit: function () {},
            on: function () {},
            isFake: true
        },
        IMPORTER_SECRET: '2fzhUceNPjTcFKjE',
        PASSPORT_COOKIE_NAME: 'auth-' + appName,
        COOKIE_SECRET: 'Uk5ZWthLqzUk5ZWthLqzUk5ZWthLqz',
        SENDGRID_AUTH: {
            user: process.env.SENDGRID_USERNAME || 'app20278627@heroku.com',
            pass: process.env.SENDGRID_PASSWORD || 's65jcndz'
        },
        SOCKET_TRANSPORTS: process.env.SOCKET_TRANSPORTS && process.env.SOCKET_TRANSPORTS.split(',') || ['websocket', 'htmlfile', 'xhr-polling', 'jsonp-polling'],
        userSockets: {},
        mongo_cfg: process.env.MONGOLAB_URI || 'mongodb://localhost/' + appName
    };
}

createConfiguration(process.env.APP_NAME || 'boilerplate');
