var mysql = require("mysql");

function SALES_ROUTER(router, pool) {
    var self = this;
    self.handleRoutes(router, pool);
}

SALES_ROUTER.prototype.handleRoutes = function (router, pool) {

    router.get("/sales/:depot", function (req, res) {
        var data = {
            error: true,
            error_msg: "",
            sales: []
        };

        if (req.params.depot === "ADMIN") {
            var query = `SELECT kode_sales, kode_sap, nama_sales, depot FROM user`;
        } else {
            var query = `SELECT kode_sales, kode_sap, nama_sales, depot FROM user WHERE depot = ?`;
        }


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
                    if (rows.length > 0) {
                        data.error = false;
                        data.error_msg = 'Success..';
                        data.sales = rows;
                        res.status(200);
                        res.json(data);
                    } else {
                        data["error_msg"] = 'No sales Found..';
                        res.status(404);
                        res.json(data);
                    }
                }
            });
        });

    });

    router.get("/sales/:depot/:kode_sales", function (req, res) {
        var data = {
            error: true,
            error_msg: "",
            sales: {}
        };

        if (req.params.depot === "ADMIN") {
            var query = `SELECT kode_sales, kode_sap, nama_sales, depot
        			FROM user WHERE kode_sales = ?`;
            var table = [req.params.kode_sales];
        } else {
            var query = `SELECT kode_sales, kode_sap, nama_sales, depot
        			FROM user WHERE kode_sales = ? AND depot = ?`;
            var table = [req.params.kode_sales, req.params.depot];
        }
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
                        data.sales = rows[0];
                        res.status(200);
                        res.json(data);
                    } else {
                        data.error_msg = 'No user Found..';
                        res.status(404);
                        res.json(data);
                    }
                }
            });
        });
    });
}

module.exports = SALES_ROUTER;
