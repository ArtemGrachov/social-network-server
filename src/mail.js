const nodemailer = require('nodemailer');
const constants = require('./constants');

module.exports = nodemailer.createTransport({
    host: constants.EMAIL_HOST,
    port: constants.EMAIL_PORT,
    auth: {
        user: constants.EMAIL_USER,
        pass: constants.EMAIL_PASSWORD
    }
});
