'use strict'

module.exports = {
    load
};

function load(){
    process.on('uncaughtException', (error, origin) => {
        console.log('> GLOBAL ERROR HANDLER');
        console.log('> ERROR: ', error);
        defaultHandler(`Uncaught exception at: ${origin}, error: ${error}`);
    });

    process.on('unhandledRejection', (reason, promisse) => {
        console.log('> GLOBAL ERROR HANDLER');
        console.log('> ERROR: ', reason);
        defaultHandler(`Unhandled rejection at: ${promisse}, reason: ${reason}`);
    });
}

function defaultHandler(errorMessage){
    let drivers = [];
    if (process.env['ERROR_DRIVE'])
        drivers = process.env['ERROR_DRIVE'].split('|');
    // console.log(drivers);

    if (drivers.indexOf('email') >= 0)
        sendAsMail(errorMessage);
    if (drivers.indexOf('api') >= 0)
        sendToApi(errorMessage);
    if (drivers.indexOf('file') >= 0)
        saveOnFile(errorMessage);
}

function sendAsMail(errorMessage){
    try {
        const mailService = require('./services/email');
        const content = mailService.loadTemplate('default', {
            title: process.env['APP'],
            erro: errorMessage
        });
        mailService.sendMail({
            from: process.env['SMTP_USER'],
            to: process.env['ERROR_EMAIL'],
            subject: 'Alerta de erro: ' + process.env['APP'],
            text: null,
            html: content,
        }, {
            service: process.env['SMTP_SERVICE'],
            host: process.env['SMTP_HOST'],
            port: process.env['SMTP_PORT'],
            secure: process.env['SMTP_SECURE'],
            user: process.env['SMTP_USER'],
            pass: process.env['SMTP_PASS'],
        });
    } catch (error) {
        console.log('> ERRO AO ENVIAR LOG');
    }

}

async function sendToApi(errorMessage){
    try {
        const requestService = require('./services/requester');
        const url = process.env['ERROR_API'] + '&error_message=' + errorMessage;
        const result = await requestService.get(url);
    } catch (error) {
        console.log('> ERRO AO ENVIAR LOG');
    }
}

function saveOnFile(errorMessage){
    try {
        const path = require('path');
        const fs   = require('fs');
        const shell = require('shelljs');
        const date = new Date();
        const dateStr = date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate();
        const timeStr = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
        const folder = path.resolve(__dirname, 'log', 'errors');
        // console.log(folder);
        if (!fs.existsSync(folder)){
            shell.mkdir('-p', folder);
        }
        const file = path.resolve(folder, dateStr + '.txt');
        if (fs.existsSync(file)) {
            fs.appendFileSync(file, timeStr + ': ' + errorMessage + '\n');
        } else {
            fs.writeFileSync(file, timeStr + ': ' + errorMessage + '\n');
        }   
    } catch (error) {
        // console.log(error);
        console.log('> ERRO AO SALVAR LOG');
    }
}