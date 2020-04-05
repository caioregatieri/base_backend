'use strict'

async function sendToS3(file){
    const serviceS3 = require("../services/serviceS3");
    try {
        const result = await (serviceS3.uploadToS3(file.path, ModelName));
        return result.Location;
    } catch (error) {
        console.log(error)
        return '';
    }
}

async function moveToFolder(oldFilePath, newPath){
    try {
        const fs = require('fs');
        const path = require('path');
        const shell = require('shelljs');
        const { promisify } = require('util');
        if (!fs.existsSync(path.dirname(newPath))) shell.mkdir('-p', path.dirname(newPath));
        const newFilePath = path.resolve(newPath, path.basename(oldFilePath));
        const renamePromisfied = promisify(fs.rename);
        await renamePromisfied(oldFilePath, newFilePath);
        await removeTempFolder(path.dirname(oldFilePath));
        return newFilePath;        
    } catch (error) {
        throw(error);   
    }
}

async function removeTempFolder(folder){
    const { promisify } = require('util');
    const rimraf = require('rimraf');
    const rimrafPromisified = promisify(rimraf);
    await rimrafPromisified(folder);
    return true;
}

module.exports = {
    moveToFolder,
    sendToS3
}