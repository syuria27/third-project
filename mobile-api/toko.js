var mysql = require("mysql");

function TOKO_ROUTER(router, pool) {
    var self = this;
    self.handleRoutes(router, pool);
}

TOKO_ROUTER.prototype.handleRoutes = function (router, pool) {

    router.get("/toko/:depot/:nama_toko", function (req, res) {
        var data = {
            error: true,
            error_msg: ""
        };

        var query = `SELECT * FROM list_toko WHERE depot = ? AND nama_toko LIKE '%${req.params.nama_toko}%' LIMIT 50`;
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
                        data.list_toko = rows;
                        res.json(data);
                    } else {
                        res.status(404);
                        data.error_msg = 'No Toko Found..';
                        res.json(data);
                    }
                }
            });
        });
    });
}

module.exports = TOKO_ROUTER;
