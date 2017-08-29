var mysql = require("mysql");

function CRM_ROUTER(router, pool) {
    var self = this;
    self.handleRoutes(router, pool);
}

CRM_ROUTER.prototype.handleRoutes = function (router, pool) {

    router.get("/crm/:kode_sales/:bulan/:tahun", function (req, res) {
        var data = {
            error: true,
            error_msg: "",
            crm: []
        };

        var query = `SELECT *, DATE_FORMAT(tanggal, '%d-%m-%Y') as tgl 
                    FROM CRM_Report WHERE kode_sales = ? AND MONTH(tanggal) = ? AND YEAR(tanggal) = ?`;
        var table = [req.params.kode_sales, req.params.bulan, req.params.tahun];
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
                        data.crm = rows;
                        res.status(200);
                        res.json(data);
                    } else {
                        data["error_msg"] = 'No crm Found..';
                        res.status(404);
                        res.json(data);
                    }
                }
            });
        });

    });
}

module.exports = CRM_ROUTER;
