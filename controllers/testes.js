'use strict'

exports.sendAsEMail = async function(req, res) {
    try {
        const emailService = require('../services/email');
        const message = {
            from: process.env.MAIL_USER,
            to: req.body.to,
            subject: req.body.subject,
            template: req.body.template,
            text: req.body.text,
        };
        const result = await emailService.send(message);
        res.send({accepted: result.accepted, rejected: result.rejected});
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
};

exports.sendToApi = async function(req, res) {
    try {
        const requestService = require('../services/requester');
        let result;
        if (req.body.method && req.body.method == 'post') {
            result = await requestService.post(req.body.url, req.body.body);
        } else {
            result = await requestService.get(req.body.url);
        }
        res.send(result);
    } catch (err) {
        res.status(500).send(err);
    }
};

exports.saveOnFile = async function(req, res) {
    try {
        const logService = require('../services/logs');
        const result = await logService.save(req.body.text);
        res.send(result);
    } catch (err) {
        res.status(500).send(err);
    }
};

exports.uploadImagesZip = async function(req, res) {
    const path = require('path');
    const imageCompress = require('../services/imageCompress');
    const moveFile = require('../utils/moveFile');

    const removeTempFile = function(file){
        const fs = require('fs');
        fs.unlinkSync(file);
    };

    const unzipFile = async function(filePath){
        const { promisify } = require('util');
        const extract = require('extract-zip');
        const extractPromisified = promisify(extract);
        const fileFolder = path.dirname(filePath);
        // const destPath = path.resolve(fileFolder, Date.now().toString());
    
        await extractPromisified(filePath, {dir: fileFolder});

        removeTempFile(filePath);

        return fileFolder
    };

    const folder = await unzipFile(req.file.path);
    
    let files = await imageCompress.start(folder);

    await (async () => {
        const a = files.map(async (file) => {
            const f = await moveFile.moveToFolder(file,  path.resolve(__dirname, '..', 'public'))
            return `${process.env.HOST}/public/${path.basename(f)}`
        });
        files = await Promise.all(a);
    })();
    
    res.send(files);
}

exports.uploadImage = async function(req, res) {
    try {
        const path = require('path');
        const imageCompress = require('../services/imageCompress');
        const moveFile = require('../utils/moveFile');
        const folder = path.dirname(req.file.path);
        const file = await imageCompress.start(folder);
        let filePath = await moveFile.moveToFolder(file[0],  path.resolve(__dirname, '..', 'public'));
        filePath = `${process.env.HOST}/public/${path.basename(filePath)}`;
        res.send(filePath);
    } catch (error) {
        res.status(500).send({
            error
        });
    }
}

exports.addressByGeo = async function(req, res) {
    try {
        const addresByGeoService = require('../services/addresByGeo');
        var result = await addresByGeoService.get(req.query.lat, req.query.lng);
        res.send(result);
    } catch (error) {
        res.status(500).send({
            error
        });
    }
}

exports.pushNotification = async function(req, res) {
    const pushNotificationService = require('../services/pushNotification');
    try {
        var ids = [];
        if (req.body.user_id) {
            var Base = require('./_base');
            var Model = require('../models/User');
            var Relateds = ['cityhall'];
            var Primarykey = 'id';
            var reqs = {
                query: {
                    id: req.body.user_id,
                    _withRelateds: true
                }
            };
            var users = await Base.get(Model, Primarykey, Relateds, reqs);
            if (users) {
                if (users[0].push_id)
                    ids.push(users[0].push_id);
            }
        }
        const message = req.body.message || 'Teste de push notification';
        const data = req.body.data;
        const result  = await pushNotificationService.sendNotification(message, data, ids);
        res.send(result);
    } catch (error) {
        throw error;
    }
}

exports.queryRaw = async function(req, res) {
    try {
        const repository = require('../repositories/_base');
        const Base = new repository();
        const result = await Base.queryRaw('select * from users limit 1');   
        res.send(result);
    } catch (error) {
        res.status(500).send({
            error
        });
    }
}

exports.mongoCreate = async function(req, res) {
    try {
        const User = require('../database/schemas/User');
        const { name, phone, email, password } = req.body;
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.json(userExists);
        }
    
        const user = await User.create({
            name,
            phone,
            email,
            password
        });
        
        return res.send(user);
    } catch (error) {
        res.status(500).send({
            error
        });
    }
}