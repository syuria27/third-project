var mysql = require("mysql");
const isset = require('isset');
const moment = require('moment');

function PRODUCT_ROUTER(router, pool) {
    var self = this;
    self.handleRoutes(router, pool);
}

PRODUCT_ROUTER.prototype.handleRoutes = function (router, pool) {

    router.get("/products", function (req, res) {
        var data = {
            error: true,
            error_msg: ""
        };

        var query = `SELECT * FROM product where status = 1`;
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
                        data.products = rows;
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
}

module.exports = PRODUCT_ROUTER;
