var mysql = require("mysql");

function NOTIFICATION_ROUTER(router, pool) {
    var self = this;
    self.handleRoutes(router, pool);
}

NOTIFICATION_ROUTER.prototype.handleRoutes = function (router, pool) {

    router.get("/notif/:depot", function (req, res) {
        var data = {
            error: true,
            error_msg: ""
        };

        var query = `SELECT judul, description FROM notification WHERE depot = ? OR depot = 'ADMIN'`;
        var table = [req.params.depot];
        query = mysql.format(query, table);
        pool.getConnection(function (err, connection) {
            connection.query(query, function (err, rows) {
                connection.release();
                if (err) {
                    res.status(500);
                    data.error_msg = "Error executing MySQL query";
                    res.json(data);
                } else {
                    if (rows.length != 0) {
                        res.status(200);
                        data.error = false;
                        data.error_msg = 'Success..';
                        data.notifications = rows;
                        res.json(data);
                    } else {
                        res.status(404);
                        data.error_msg = 'No Notification Found..';
                        res.json(data);
                    }
                }
            });
        });
    });
}

module.exports = NOTIFICATION_ROUTER;