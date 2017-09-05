var mysql = require("mysql");
const isset = require('isset');

function ORDER_ROUTER(router, pool) {
    var self = this;
    self.handleRoutes(router, pool);
}

ORDER_ROUTER.prototype.handleRoutes = function (router, pool) {

    router.get("/order/:kode_order", function (req, res) {
        var data = {
            error: true,
            error_msg: "",
            order: {}
        };

        var query = `SELECT DATE_FORMAT(tanggal, '%d-%m-%Y') as tanggal, nama_toko, kode_sap, 
                    REPLACE(message,'\n','<br>') as message FROM sales_order WHERE kode_order = ?`;
        var table = [req.params.kode_order];
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
                        data.error = false;
                        data.error_msg = 'Success..';
                        data.order = rows[0];
                        res.status(200);
                        res.json(data);
                    } else {
                        data.error_msg = 'No Order Found..';
                        res.status(404);
                        res.json(data);
                    }
                }
            });
        });

    });

    router.get("/order/:depot/:tanggal", function (req, res) {
        var data = {
            error: true,
            error_msg: "",
            order: []
        };

        if (req.params.depot === "ADMIN") {
            var query = `SELECT a.kode_order, b.nama_sales, b.kode_sap, b.depot FROM sales_order a 
                        LEFT JOIN user b ON a.kode_sales = b.kode_sales WHERE a.tanggal = ?`;
            var table = [req.params.tanggal];
        } else {
            var query = `SELECT a.kode_order, b.nama_sales, b.kode_sap, b.depot FROM sales_order a 
                        LEFT JOIN user b ON a.kode_sales = b.kode_sales WHERE b.depot = ? AND a.tanggal = ?`;
            var table = [req.params.depot, req.params.tanggal];
        }

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
                        data.error = false;
                        data.error_msg = 'Success..';
                        data.order = rows;
                        res.status(200);
                        res.json(data);
                    } else {
                        data.error_msg = 'No Absen Found..';
                        res.status(404);
                        res.json(data);
                    }
                }
            });
        });

    });
}

module.exports = ORDER_ROUTER;
