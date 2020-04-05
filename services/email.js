'use strict'

const send = async (options) => {
    try {
        const html = options.template ? generateHTML(options.template, options.templateOptions) : null;
        const text = options.text; //htmlToText.fromString(html);
        const mailOptions = {
          from: process.env.MAIL_USER,
          to: options.to,
          subject: options.subject,
          html,
          text
        };
        const transport = makeTransporter();
        return await transport.sendMail(mailOptions);
    } catch (error) {
        throw(error)
    }
  }

function makeTransporter() {
    const nodemailer = require('nodemailer');

    const transporterConfig = {
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS
        }
    };

    switch (process.env.MAIL_SERVICE) {
        case 'sendmail': 
            transporterConfig.service = process.env.MAIL_SERVICE;
            break;
        case 'gmail': 
            transporterConfig.service = process.env.MAIL_SERVICE;
            break;
        case 'hotmail': 
            transporterConfig.service = process.env.MAIL_SERVICE;
            break;
        case 'outlook': 
            transporterConfig.host = 'smtp-mail.outlook.com';
            transporterConfig.secureConnection = false;
            transporterConfig.port = 587;
            transporterConfig.tls = {
                ciphers: 'SSLv3'
            };
            break;
        case 'manual': 
            transporterConfig.host   = process.env.MAIL_HOST;
            transporterConfig.port   = process.env.MAIL_PORT;
            transporterConfig.secure = process.env.MAIL_PORT == 465 ? true : process.env.MAIL_SECURE;
            break;
    }

    return nodemailer.createTransport(transporterConfig);
}

const generateHTML = (template, options = {}) => {
    const juice = require('juice');
    const pug = require('pug');

    try {
        const html = pug.renderFile(`${__dirname}/../templates/email/${template}.pug`, options);
        const inlined = juice(html);
        return inlined;
    } catch (error) {
        throw(error)
    }

  }

module.exports = {
    send,
    generateHTML,
};