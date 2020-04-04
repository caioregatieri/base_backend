var express = require('express');
var router = express.Router();
var path = require('path');

var upload = require('../middlewares/multer')(path.resolve(__dirname, '../uploads'));
var controller = require('../controllers/testes');

router.post('/send-as-email',     controller.sendAsEMail);
router.post('/send-to-api',       controller.sendToApi);
router.post('/save-on-file',      controller.saveOnFile);
router.post('/upload-image',      upload.single('imagefile'), controller.uploadImage);
router.post('/upload-images-zip', upload.single('filezip'),   controller.uploadImagesZip);
router.get('/address-by-geo',     controller.addressByGeo);
router.post('/push-notification', controller.pushNotification);

router.get('/query-raw',          controller.queryRaw);

module.exports = router;