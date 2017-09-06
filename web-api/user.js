var mysql = require("mysql");
const isset = require('isset');
const pad = require('pad-left');
const md5 = require("md5");

function USER_ROUTER(router, pool) {
    var self = this;
    self.handleRoutes(router, pool);
}

USER_ROUTER.prototype.handleRoutes = function (router, pool) {

    router.post("/user/create", function (req, res) {
        var data = {
            error: true,
            error_msg: ""
        };

        if (isset(req.body.nama_sales) && isset(req.body.depot) && isset(req.body.kode_sap) && isset(req.body.hak_akses)) {

            var query = `INSERT INTO user (nama_sales, depot, kode_sap) 
                        VALUES (UPPER(?), UPPER(TRIM(?)), ?)`;
            var table = [req.body.nama_sales, req.body.depot, req.body.kode_sap];
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
                        var kode_sales = 'SLS-' + (pad(results.insertId, 4, '0'));
                        var query = `UPDATE user SET kode_sales = ? WHERE id = ?`;
                        var table = [kode_sales, results.insertId];
                        query = mysql.format(query, table);
                        pool.getConnection(function (err, connection) {
                            connection.query(query, function (err) {
                                connection.release();
                                if (err) {
                                    res.status(500);
                                    data.error_msg = "Error executing MySQL query";
                                    res.json(data);
                                } else {
                                    var query = `INSERT INTO login (kode_sales, password, hak_akses) VALUES (?, ?, ?)`;
                                    var table = [kode_sales, md5(req.body.nama_sales.toUpperCase()), req.body.hak_akses];
                                    query = mysql.format(query, table);
                                    pool.getConnection(function (err, connection) {
                                        connection.query(query, function (err, rows) {
                                            connection.release();
                                            if (err) {
                                                res.status(500);
                                                data.error_msg = "Error executing MySQL query";
                                                res.json(data);
                                            } else {
                                                res.status(200);
                                                data.error = false;
                                                data.error_msg = 'User succesfuly created..'+' Username : '+kode_sales;
                                                res.json(data);
                                            }
                                        });
                                    });
                                }
                            });
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

    router.put("/user/update", function (req, res) {
        var data = {
            error: true,
            error_msg: ""
        };

        if (isset(req.body.kode_sales) && isset(req.body.nama_sales) && isset(req.body.depot) && isset(req.body.kode_sap)) {
            var query = `UPDATE user SET nama_sales = UPPER(?), depot = UPPER(TRIM(?)), kode_sap = ? WHERE kode_sales = ?`;
            var table = [req.body.nama_sales, req.body.depot, req.body.kode_sap, req.body.kode_sales];
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
                        data.error_msg = 'User succesfuly updated..';
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

    router.put("/user/password", function (req, res) {
        var data = {
            error: true,
            error_msg: ""
        };

        if (isset(req.body.kode_sales) && isset(req.body.password)) {
            var query = `UPDATE login SET password = ? WHERE kode_sales = ?`;
            var table = [md5(req.body.password), req.body.kode_sales];
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
                        data.error_msg = 'Password succesfuly updated..';
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

    router.put("/user/status", function (req, res) {
        var data = {
            error: true,
            error_msg: ""
        };

        if (isset(req.body.kode_sales) && isset(req.body.status)) {
            var query = `UPDATE user SET status = ? WHERE kode_sales = ?`;
            var table = [req.body.status, req.body.kode_sales];
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
                        data.error_msg = 'Status succesfuly updated..';
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

    router.get("/users", function (req, res) {
        var data = {
            error: true,
            error_msg: "",
            users: []
        };

        var query = `SELECT u.kode_sales, nama_sales, depot, kode_sap, status, hak_akses
                     FROM user u LEFT JOIN login l ON u.kode_sales = l.kode_sales WHERE hak_akses < 3 OR hak_akses = 4`;
        query = mysql.format(query);
        pool.getConnection(function (err, connection) {
            connection.query(query, function (err, rows) {
                connection.release();
                if (err) {
                    res.status(500);
                    data.error_msg = "Error executing MySQL query";
                    res.json(data);
                } else {
                    if (rows.length > 0) {
                        data.error = false;
                        data.error_msg = 'Success..';
                        data.users = rows;
                        res.status(200);
                        res.json(data);
                    } else {
                        data["error_msg"] = 'No users Found..';
                        res.status(404);
                        res.json(data);
                    }
                }
            });
        });

    });

    router.get("/user/:kode_sales", function (req, res) {
        var data = {
            error: true,
            error_msg: "",
            user: []
        };

        var query = `SELECT u.kode_sales, nama_sales, depot, kode_sap, status, hak_akses
                     FROM user u LEFT JOIN login l ON u.kode_sales = l.kode_sales
                     WHERE u.kode_sales = ?`;
        var table = [req.params.kode_sales];
        query = mysql.format(query, table);
        pool.getConnection(function (err, connection) {
            connection.query(query, function (err, rows) {
                connection.release();
                if (err) {
                    res.status(500);
                    data.error_msg = "Error executing MySQL query";
                    res.json(data);
                } else {
                    if (rows.length > 0) {
                        data.error = false;
                        data.error_msg = 'Success..';
                        data.user = rows[0];
                        res.status(200);
                        res.json(data);
                    } else {
                        data["error_msg"] = 'No users Found..';
                        res.status(404);
                        res.json(data);
                    }
                }
            });
        });

    });

}

module.exports = USER_ROUTER;