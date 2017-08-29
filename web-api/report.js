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

        var query = `SELECT kode_report,
                    DATE_FORMAT(tanggal, '%d-%m-%Y') AS tanggal,
                    nama_toko, kode_sap, alamat, keterangan 
                    FROM sales_report 
                    WHERE kode_sales = ? AND MONTH(tanggal) = ? AND YEAR(tanggal) = ?`;
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
