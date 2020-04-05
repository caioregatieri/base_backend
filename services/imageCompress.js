'use strict'

async function start(images_path){
    const path = require('path');
    const fs = require('fs');
    if (!fs.existsSync(images_path)) {
        throw new Error('Folder not found: ' + images_path);
    }
    const destFolder = path.join(images_path, 'compressed');
    if (!fs.existsSync(destFolder)) {
        fs.mkdirSync(destFolder);
    };
    // const validFiles = origFiles.filter(el => el.includes('.jpg') || el.includes('.png'))
    await compress2(images_path, destFolder);
    await moveImagesToParentFolder(destFolder);
    await removeTempFolder(destFolder);
    const origFiles = await readDir(images_path);
    return origFiles;
}

function compress1(images_path, compressed_images_path){
    const compress_images = require('compress-image');

    const INPUT_PATH = images_path + '/*.{jpg,JPG,jpeg,JPEG,png,svg,gif}';
    const OUTPUT_PATH = compressed_images_path;

    return new Promise((resolve, reject) => {
        compress_images(INPUT_PATH, OUTPUT_PATH, 
            {compress_force: false, pathLog: true, statistic: true, autoupdate: true}, false,
            {jpg: {engine: 'mozjpeg', command: ['-quality', '60']}},
            {png: {engine: 'pngquant', command: ['--quality=20-50']}},
            {svg: {engine: 'svgo', command: '--multipass'}},
            {gif: {engine: 'gifsicle', command: ['--colors', '64', '--use-col=web']}}, 
            function(err, completed, statistic){
                if (err){
                    reject(err);
                } 
                if (completed){
                    resolve(completed);
                }
            }
        );
    });
}

function compress2(images_path, compressed_images_path){
    const INPUT_PATH = images_path + '/*.{jpg,png}';
    const OUTPUT_PATH = compressed_images_path;

    const imagemin = require('imagemin');
    const imageminJpegtran = require('imagemin-jpegtran');
    const imageminPngquant = require('imagemin-pngquant');

    return imagemin([INPUT_PATH], {
        destination: OUTPUT_PATH,
        plugins: [
            imageminJpegtran(),
            imageminPngquant({
                quality: [0.6, 0.8]
            })
        ]
    });
}

async function moveImagesToParentFolder(folder){
    const path = require('path');
    const parentFolder = path.resolve(folder, '..');
    const files = await readDir(folder);
    for(let file of files) {
        var filename = path.basename(file)
        await moveFile(file, path.resolve(parentFolder, filename));
    };
    return true;
}

async function readDir(local){
    const path = require('path');
    const fs = require('fs');
    const { promisify } = require('util');
    const readdirPromisfied = promisify(fs.readdir);
    const files = await readdirPromisfied(local);
    return files.map((el) => {
        return path.resolve(local, el); 
    });
}

function moveFile(oldPath, newPath){
    const { promisify } = require('util');
    const fs = require('fs');
    const renamePromisfied = promisify(fs.rename);
    return renamePromisfied(oldPath, newPath);
}

async function removeTempFolder(folder){
    const { promisify } = require('util');
    const rimraf = require('rimraf');
    const rimrafPromisified = promisify(rimraf);
    await rimrafPromisified(folder);
    return true;
}

module.exports = {
    start: start,
};