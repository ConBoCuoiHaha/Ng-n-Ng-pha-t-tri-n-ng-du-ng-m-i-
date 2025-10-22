var express = require('express');
var router = express.Router();
var path = require('path')
let fs = require('fs')
let { uploadAFileWithField, uploadMultiFilesWithField } = require('../utils/uploadHandler')
const { Response } = require('../utils/responseHandler');

router.get('/:filename', function (req, res, next) {
    let pathFile = path.join(__dirname, "../resources/files/", req.params.filename);
    let pathImage = path.join(__dirname, "../resources/images/", req.params.filename);
    if (fs.existsSync(pathFile)) {
        res.status(200).sendFile(pathFile);
    } else if (fs.existsSync(pathImage)) {
        res.status(200).sendFile(pathImage);
    } else {
        Response(res, 404, false, "File not found");
    }
})

router.post("/uploads", uploadAFileWithField('image'), function (req, res, next) {
    if (!req.file) {
        return Response(res, 400, false, "No file uploaded or invalid type");
    }
    // Always return /files/...; GET handler serves from files or images folders
    let URL = `${req.protocol}://${req.get('host')}/files/${req.file.filename}`
    Response(res, 200, true, URL)
})

router.post("/uploadMulti", uploadMultiFilesWithField('image'), function (req, res, next) {
    if (!req.files || req.files.length === 0) {
        return Response(res, 400, false, "No files uploaded or invalid types");
    }
    let URLs = req.files.map(function (file) {
        return `${req.protocol}://${req.get('host')}/files/${file.filename}`
    })
    Response(res, 200, true, URLs)
})

module.exports = router;
