var mysql = require("mysql");
const isset = require('isset');
var FCM = require('fcm-node');
var serverKey = require('./salesapp-f6faa-firebase-adminsdk-5lzco-0ba04cff05.json');
var fcm = new FCM(serverKey);

function FCM_ROUTER(router,pool) {
    var self = this;
    self.handleRoutes(router,pool);
}

FCM_ROUTER.prototype.handleRoutes = function (router,pool) {

    var data = {
        error: true,
        error_msg: ""
    };
    
    router.post("/fcm", function (req, res) {
        var data = {
            error: true,
            error_msg: ""
        };

        if (isset(req.body.judul) && isset(req.body.short_desc)
             && isset(req.body.description) && isset(req.body.depot)) {

            var query = `INSERT INTO notification 
                        (tanggal, judul, short_desc, 
                        description, depot)
                         VALUES (NOW(),?,?,?,?)`;
            var table = [req.body.judul, req.body.short_desc, 
                        req.body.description, req.body.depot];
            query = mysql.format(query, table);
            pool.getConnection(function (err, connection) {
                if (err) console.log(err);
                connection.query(query, function (err, results) {
                    connection.release();
                    if (err) {
                        res.status(500);
                        data.error_msg = "Error executing MySQL query";
                        res.json(data);
                    } else {
                        var message = {
                            to: '/topics/'+req.body.depot,
                                
                            notification: {
                                title: req.body.judul,
                                body: req.body.short_desc,
                                icon: 'ic_notifications_black_24dp',
                                sound: 'defaultSoundUri'
                            },

                        }

                        fcm.send(message, function (err, response) {
                            if (err) {
                                console.log(err)
                                res.status(200);
                                data.error_msg = "Success submit notification";
                                res.json(data);
                            } else {
                                res.status(200);
                                data.error = false;
                                data.error_msg = 'Success sand notification..';
                                data.kode_notification = response.messageId;
                                res.json(data);
                            }
                        });
                    }
                });
            });

        } else {
            res.status(400);
            data.error_msg = "Missing some params..";
            res.json(data);
        }
    });
}

module.exports = FCM_ROUTER;