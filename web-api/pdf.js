var multer  = require('multer')
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
  }
});
var upload = multer({ storage: storage }).any();

function PDF_ROUTER(router) {
    var self = this;
    self.handleRoutes(router);
}

PDF_ROUTER.prototype.handleRoutes = function (router) {

    var data = {
        error: true,
        error_msg: ""
    };
    
    router.post('/pdf', function (req, res) {
        upload(req, res, function (err) {
            if (err) {
                res.status(500);
                data.error_msg = "Error upload file..";
                res.json(data);
            }

            data.error = false;
            data.error_msg = 'Success..';
            res.status(200);
            res.json(data);
        })
    })
}

module.exports = PDF_ROUTER;
