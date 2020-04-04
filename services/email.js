function sendMail(messages, smtpConfigs) {
    var nodemailer = require('nodemailer');

    return new Promise((resolve, reject) => {
        let errors = [];
        let success = [];

        if (!Array.isArray(messages)) {
            messages = [messages];
        }

        messages.forEach(message => {
            errors = validateMessage(message);             
            if (errors.length)
                reject(errors);
        });

        errors = validateSmpt(smtpConfigs);             
        if (errors.length)
            reject(errors); 

        messages = messages.map((email) => {
            return {
                from:        smtpConfigs.user,
                to:          email.to,
                subject:     email.subject,
                text:        email.text,
                html:        email.html,
                attachments: email.attachments
            };
        });

        const transporterConfig = {
            pool: true,
            auth: {
                user: smtpConfigs.user,
                pass: smtpConfigs.pass
            }
        };

        switch (smtpConfigs.service) {
            case 'sendmail': 
                transporterConfig.service = smtpConfigs.service;
                break;
            case 'gmail': 
                transporterConfig.service = smtpConfigs.service;
                break;
            case 'hotmail': 
                transporterConfig.service = smtpConfigs.service;
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
                transporterConfig.host   = smtpConfigs.host;
                transporterConfig.port   = smtpConfigs.port;
                transporterConfig.secure = smtpConfigs.port == 465 ? true : smtp_configs.secure;
                break;
        }

        const transporter = nodemailer.createTransport(transporterConfig);
        // console.log('transporter.isIdle: ' + transporter.isIdle());

        transporter.on('idle', function(){
            // send next message from the pending queue
            while (transporter.isIdle() && messages.length) {
                let message = messages.shift();
                transporter.sendMail(
                    message, 
                    function(err, info) {
                        if (err) {
                            console.log('> ERROR AO ENVIAR E-MAIL', err);
                            errors.push({
                                to: message.to,
                                error: err
                            });
                        } else {
                            success.push({
                                to: message.to,
                                success: true
                            });
                        }
                        
                    }
                );
            }
            if (errors.length > 0) {
                reject(errors);
            } else {
                resolve(success);
            }
        });
    });
}

function validateMessage(message) {
    const errors = [];
    if (!message) {
        errors.push('The \'message\' is null');
        return errors;
    }
    if (!message.from) {
        errors.push('The field \'from\' is required');
    }
    if (!message.to) {
        errors.push('The field \'to\' is required');
    }
    if (!message.subject) {
        errors.push('The field \'subject\' is required');
    }
    if (!message.text && !message.html) {
        errors.push('The field \'text\' or \'html\' is required');
    }
    return errors;
}

function validateSmpt(configs) {
    const errors = [];
    if (!configs) {
        errors.push('The \'smtpConfigs\' is null');
        return errors;
    }
    if (!configs.service) {
        errors.push('The .env \'smtp service\' is not setted');
    }
    if (configs.service == 'manual' && !configs.host) {
        errors.push('The .env \'smtp host\' is not setted');
    }
    if (configs.service == 'manual' && !configs.port) {
        errors.push('The .env \'smtp port\' is not setted');
    }
    if (!configs.user) {
        errors.push('The .env \'smtp user\' is not setted');
    }
    if (!configs.pass) {
        errors.push('The .env \'smtp pass\' is not setted');
    }
    return errors;
}

function loadTemplate(template, data) {
    var path = require('path');
    var fs = require('fs');
    return new Promise((resolve, reject) => {
        var file = path.join(__dirname, '../templates/emails', template +'.html');
        if (!fs.existsSync(file)){
            reject('File \'' + file + '\' not found');
        }
        fs.readFile(file, 'utf8', function(err, html){
            if (err) {
                console.log(err);
                reject(err);
            }
            if (data) {
                Object.keys(data).forEach(function(key){
                    html = html.replace(new RegExp(el, 'g'), data[key]);
                });
            }
            resolve(html);
        });
    });
}

module.exports = {
    sendMail: sendMail,
    loadTemplate: loadTemplate,
};