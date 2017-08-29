var mysql = require("mysql");

function REPORT_ROUTER(router, pool) {
    var self = this;
    self.handleRoutes(router, pool);
}

REPORT_ROUTER.prototype.handleRoutes = function (router, pool) {

    router.get("/report/:kode_sales/:bulan/:tahun", function (req, res) {
        var data = {
            error: true,
            error_msg: "",
            crm: []
        };

        var query = `SELECT sr.kode_report, sr.kode_sales, u.nama_sales, u.depot, 
                    DATE_FORMAT(sr.tanggal, '%d-%m-%Y') AS tanggal,
                    sr.nama_toko, sr.kode_sap, sr.alamat, sr.keterangan 
                    FROM sales_report sr LEFT JOIN user u ON sr.kode_sales = u.kode_sales 
                    WHERE sr.kode_sales = ? AND MONTH(sr.tanggal) = ? AND YEAR(sr.tanggal) = ?`;
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

module.exports = REPORT_ROUTER;
