'use strict'

const express = require('express');
const router = express.Router();
const path = require('path');

const upload = require('../middlewares/multer')(path.resolve(__dirname, '../uploads'));
const controller = require('../controllers/testes');

router.post('/send-as-email',     controller.sendAsEMail);
router.post('/send-to-api',       controller.sendToApi);
router.post('/save-on-file',      controller.saveOnFile);
router.post('/upload-image',      upload.single('imagefile'), controller.uploadImage);
router.post('/upload-images-zip', upload.single('filezip'),   controller.uploadImagesZip);
router.get('/address-by-geo',     controller.addressByGeo);
router.post('/push-notification', controller.pushNotification);

router.get('/query-raw',          controller.queryRaw);
router.post('/mongo-create',      controller.mongoCreate);

module.exports = router;