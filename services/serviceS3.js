'use strict'

const fs = require('fs');
const path = require('path');

const aws = require('aws-sdk');

aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const spacesEndpoint = new aws.Endpoint(process.env.AWS_ENDPOINT);
const s3 = new aws.S3({
  endpoint: spacesEndpoint
});

exports.listObjctsFromS3 = function(folder){
  const params = { 
    Bucket: process.env.AWS_BUCKET,
    Delimiter: '/',
  };

  if (folder != undefined) 
    params.Prefix = folder + "/";
 
  return new Promise((resolve, reject) => {
    s3.listObjects(params, function (err, data) {
      if (err) {
        reject(err);
      } else {
        ret = data
                .Contents
                .filter((el) => {
                  if (el.Key != params.Prefix) return el;
                })
                .map((el) => {
                  el.Url = "https://" + process.env.AWS_BUCKET + "." + process.env.AWS_ENDPOINT + "/" + el.Key;
                  return el;
                });
        resolve(ret);
      } 
    });
  });
};

exports.uploadToS3 = function(file, folder) {
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: process.env.AWS_BUCKET,
      Body : fs.createReadStream(file),
      Key : folder ? folder + "/" + path.basename(file) : path.basename(file),
      ACL: 'public-read'
    };

    s3.upload(params, function (err, data) {
      if (err) {
        reject(err);
      }
      if (data) {
        resolve(data);
      }
    });

  });

};

exports.downloadFromS3 = function(objectKey, destPath){
  const request = require('request');

  if (!fs.existsSync(destPath)){
    fs.mkdirSync(destPath);
  }

  const objectBaseName = objectKey.split("/")[1]; 
  destPath = path.join(destPath, objectBaseName);
  const objectUrl = "https://" + process.env.AWS_BUCKET + "." + process.env.AWS_ENDPOINT + "/" + objectKey;

  return new Promise((resolve, reject) => {
    try{
      var file = fs.createWriteStream(destPath);
      var r = request(objectUrl).pipe(file);
  
      // file.on('finish', function(){
      //   resolve(destPath);
      // });

      r.on('close', function(){
        resolve(destPath);
      });

      r.on('error', function(err) {
        reject(err);
      });
    }catch(e){
      reject(e);
    }
    
  });

};

exports.deleteFromS3 = function(keys){
  const params = {
    Bucket: process.env.AWS_BUCKET, 
    Delete: { // required
      Objects: keys,
    },
  };

  //console.log(params);

  return new Promise((resolve, reject) => {
    s3.deleteObjects(params, function(err, data) {
      if (err) {
        reject(err);
      } else {   
        resolve(data);
      }
    });
  });
  
};
