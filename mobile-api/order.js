var mysql = require("mysql");
const isset = require('isset');
const pad = require('pad-left');

function ORDER_ROUTER(router, pool) {
    var self = this;
    self.handleRoutes(router, pool);
}

ORDER_ROUTER.prototype.handleRoutes = function (router, pool) {

    router.post("/order/insert", function (req, res) {
        var data = {
            error: true,
            error_msg: ""
        };

        if (isset(req.body.kode_sales) && isset(req.body.nama_toko)
             && isset(req.body.kode_sap) && isset(req.body.message)) {
            
            var query = `SELECT id FROM sales_order WHERE kode_sales = ? AND kode_sap = ?
                         AND tanggal = DATE(CONVERT_TZ(CURDATE(),@@session.time_zone,'+07:00'))`;
            var table = [req.body.kode_sales, req.body.kode_sap];
            query = mysql.format(query, table);
            pool.getConnection(function (err, connection) {
                connection.query(query, function (err, rows) {
                    connection.release();
                    if (err) {
                        console.log(err);
                        res.status(500);
                        data.error_msg = "Error executing MySQL query";
                        res.json(data);
                    } else {
                        if (rows.length > 0) {
                            res.status(404);
                            data.error_msg = 'Order already submited..';
                            res.json(data);
                        } else {
                            var query = `INSERT INTO sales_order (kode_sales, tanggal, nama_toko, kode_sap, message) 
									    VALUES(?, CONVERT_TZ(NOW(),@@session.time_zone,'+07:00'), ?, ?, ?)`;
                            var table = [req.body.kode_sales, req.body.nama_toko, req.body.kode_sap, req.body.message];
                            query = mysql.format(query, table);
                            pool.getConnection(function (err, connection) {
                                connection.query(query, function (err, results) {
                                    connection.release();
                                    if (err) {
                                        console.log(err);
                                        res.status(500);
                                        data.error_msg = "Error executing MySQL query";
                                        res.json(data);
                                    } else {
                                        var kode_report = 'SPO-' + (pad(results.insertId, 11, '0'));
                                        var query = `UPDATE sales_order SET kode_order = ? WHERE id = ?`;
                                        var table = [kode_report, results.insertId];
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
                                                    data.error_msg = 'Order succesfuly submited..';
                                                    res.json(data);
                                                }
                                            });
                                        });
                                    }
                                });
                            });
                        }
                    }
                });
            });
        } else {
            res.status(400);
            data.error_msg = 'Missing some params..';
            res.json(data);
        }
    });

    router.get("/order/:kode_sales/:tanggal", function (req, res) {
        var data = {
            error: true,
            error_msg: ""
        };

        var query = `SELECT kode_order,DATE_FORMAT(tanggal, '%d-%m-%Y')
                    as tanggal, nama_toko, kode_sap, message
        			FROM sales_order WHERE kode_sales = ? AND tanggal = ?`;
        var table = [req.params.kode_sales, req.params.tanggal];
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
                        data.history = rows;
                        res.json(data);
                    } else {
                        res.status(404);
                        data.error_msg = 'No History Found..';
                        res.json(data);
                    }
                }
            });
        });
    });

    router.put("/order/update", function (req, res) {
        var data = {
            error: true,
            error_msg: ""
        };

        if (isset(req.body.kode_order) && isset(req.body.message)) {
            
            var query = `UPDATE sales_order SET message = ? WHERE kode_order = ?`;
            var table = [req.body.message, req.body.kode_order];
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
                        data.error_msg = 'Order succesfuly updated..';
                        res.json(data);
                    }
                });
            });
        } else {
            res.status(400);
            data.error_msg = 'Missing some params..';
            res.json(data);
        }
    });
}

module.exports = ORDER_ROUTER;
