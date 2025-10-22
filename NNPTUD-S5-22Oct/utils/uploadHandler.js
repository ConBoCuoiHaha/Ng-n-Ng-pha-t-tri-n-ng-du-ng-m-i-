let multer = require('multer');
var path = require('path')
let Storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (file.mimetype.startsWith("image")) {
            let pathFileStorage = path.join(__dirname, "../resources/images");
            cb(null, pathFileStorage);
        } else {
            let pathFileStorage = path.join(__dirname, "../resources/files");
            cb(null, pathFileStorage);
        }
    },
    filename: function (req, file, cb) {
        let extensionName = path.extname(file.originalname)
        cb(null, Date.now() + extensionName);
    }
});
let upload = multer({
            storage: Storage,
            fileFilter: function (req, file, cb) {
                console.log(file.mimetype);
                if (!file.mimetype.startsWith("image") && !file.mimetype.startsWith("application/pdf")) {
                    cb(null, false)
                } else {
                    cb(null, true)
                }
            },
            limits: {
                fileSize: 5 * 1024 * 1024
            }
        })
module.exports = {
    uploadAFileWithField: function (field) {
        return upload.single(field)
    },
    uploadMultiFilesWithField: function (field) {
        return upload.array(field)
    }
}
