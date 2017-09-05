var mysql = require("mysql");
const isset = require('isset');
const pad = require('pad-left');

function EMAIL_ROUTER(router, pool) {
    var self = this;
    self.handleRoutes(router, pool);
}

EMAIL_ROUTER.prototype.handleRoutes = function (router, pool) {

    router.get("/emails", function (req, res) {
        var data = {
            error: true,
            error_msg: ""
        };

        var query = `SELECT depot, email FROM email_order`;
        query = mysql.format(query);
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
                        data.emails = rows;
                        res.json(data);
                    } else {
                        res.status(404);
                        data.error_msg = 'No Email Found..';
                        res.json(data);
                    }
                }
            });
        });
    });

    router.get("/email/:depot", function (req, res) {
        var data = {
            error: true,
            error_msg: ""
        };

        var query = `SELECT depot, email FROM email_order WHERE depot = ? `;
        var table = [req.params.depot];
        query = mysql.format(query,table);
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
                        data.email = rows[0];
                        res.json(data);
                    } else {
                        res.status(404);
                        data.error_msg = 'No product Found..';
                        res.json(data);
                    }
                }
            });
        });
    });

    router.post("/email/create", function (req, res) {
        var data = {
            error: true,
            error_msg: ""
        };

        if (isset(req.body.depot) && (isset(req.body.email))){

            var query = `INSERT INTO email_order (depot, email) VALUES (TRIM(UPPER(?)),?)`;
            var table = [req.body.depot, req.body.email];
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
                        res.status(200);
                        data.error = false;
                        data.error_msg = 'Email succesfuly created..';
                        res.json(data);
                           
                    }
                });
            });

        } else {
            res.status(400);
            data.error_msg = "Missing some params..";
            res.json(data);
        }
    });

    router.put("/email/update", function (req, res) {
        var data = {
            error: true,
            error_msg: ""
        };

        if (isset(req.body.depot) && isset(req.body.email)) {
            var query = `UPDATE email_order SET email = ? WHERE depot = ?`;
            var table = [req.body.email, req.body.depot];
            query = mysql.format(query, table);
            pool.getConnection(function (err, connection) {
                connection.query(query, function (err) {
                    connection.release();
                    if (err) {
                        res.status(500);
                        data.error_msg = "Error executing MySQL query";
                        res.json(data);
                    } else {
                        res.status(200);
                        data.error = false;
                        data.error_msg = 'Email succesfuly updated..';
                        res.json(data);
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

module.exports = EMAIL_ROUTER;
