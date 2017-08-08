var mysql = require("mysql");
const moment = require('moment');
const isset = require('isset');
const fs = require('fs');
const pad = require('pad-left');

function REPORT_ROUTER(router, pool) {
    var self = this;
    self.handleRoutes(router, pool);
}

REPORT_ROUTER.prototype.handleRoutes = function (router, pool) {

    router.get("/report/:kode_sales/:bulan/:tahun", function (req, res) {
        var data = {
            error: true,
            error_msg: ""
        };

        var query = `SELECT kode_report,DATE_FORMAT(tanggal, '%d-%m-%Y') as tanggal,nama_toko,kode_sap,alamat,keterangan
        			FROM sales_report WHERE kode_sales = ? AND MONTH(tanggal) = ? AND YEAR(tanggal) = ?`;
        var table = [req.params.kode_sales, req.params.bulan, req.params.tahun];
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

    router.post("/report", function (req, res) {
        var data = {
            error: true,
            error_msg: ""
        };

        if (isset(req.body.kode_sales) && isset(req.body.nama_toko) && isset(req.body.kode_sap)
            && isset(req.body.alamat) && isset(req.body.keterangan) && isset(req.body.photo)) {
            
            if (false) {
                res.status(400);
                data.error_msg = 'Lewat waktu absen';
                res.json(data);
            } else {
                var query = `SELECT kode_report FROM sales_report WHERE kode_sales = ? AND tanggal 
	        				= DATE(CONVERT_TZ(NOW(),@@session.time_zone,'+07:00')) AND kode_sap = ?`;
                var table = [req.body.kode_sales, req.body.kode_sap];
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
                                res.status(400);
                                data.error = true;
                                data.error_msg = 'Already Submited..';
                                res.json(data);
                            } else {
                                var query = `INSERT INTO sales_report (kode_sales, tanggal, nama_toko, kode_sap, alamat, keterangan) 
                                            VALUES(?, CONVERT_TZ(NOW(),@@session.time_zone,'+07:00'), ?, ?, ?, ?)`;
                                var table = [req.body.kode_sales, req.body.nama_toko, req.body.kode_sap, req.body.alamat, req.body.keterangan];
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
                                            var kode_report = 'RPT-' + (pad(results.insertId, 11, '0'));
                                            var query = `UPDATE sales_report SET kode_report = ? WHERE id = ?`;
                                            var table = [kode_report, results.insertId];
                                            query = mysql.format(query, table);
                                            pool.getConnection(function (err, connection) {
                                                connection.query(query, function (err) {
                                                    connection.release();
                                                    if (err) {
                                                        console.log(err);
                                                        res.status(500);
                                                        data.error_msg = "Error executing MySQL query";
                                                        res.json(data);
                                                    } else {
                                                        fs.writeFile('./upload/' + kode_report + '.jpeg', req.body.photo, 'base64', function (err) {
                                                        });
                                                        res.status(200);
                                                        data.error = false;
                                                        data.error_msg = 'Report succesfuly submited';
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
            }
        } else {
            res.status(400);
            data.error_msg = "Missing some params..";
            res.json(data);
        }
    });

}

module.exports = REPORT_ROUTER;
