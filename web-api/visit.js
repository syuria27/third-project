var mysql = require("mysql");

function VISIT_ROUTER(router, pool) {
    var self = this;
    self.handleRoutes(router, pool);
}

VISIT_ROUTER.prototype.handleRoutes = function (router, pool) {

    router.get("/visit/:kode_sales/:tanggal", function (req, res) {
        var data = {
            error: true,
            error_msg: "",
            visit: []
        };

        var query = `SELECT kode_visit, DATE_FORMAT(tanggal, '%d-%m-%Y') as tgl,
                    nama_toko, jam_masuk, lokasi_masuk, 
                    CAST(COALESCE(jam_pulang, ' ') AS CHAR) AS jam_pulang,
                    COALESCE(lokasi_pulang, ' ') AS lokasi_pulang,
                    COALESCE(selisih, 0) AS selisih
                    FROM visit WHERE kode_sales = ? AND tanggal = ?`;
        var table = [req.params.kode_sales, req.params.tanggal];
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
                        rows.forEach(function (visit) {
                            var abs = {
                                kode_visit: visit.kode_visit,
                                tanggal: visit.tgl,
                                nama_toko: visit.nama_toko,
                                jam_masuk: visit.jam_masuk,
                                lokasi_masuk: visit.lokasi_masuk,
                                jam_pulang: visit.jam_pulang,
                                lokasi_pulang: visit.lokasi_pulang,
                                selisih: visit.selisih
                            }
                            data.visit.push(abs);
                        });
                        res.status(200);
                        res.json(data);
                    } else {
                        data["error_msg"] = 'No visit Found..';
                        res.status(404);
                        res.json(data);
                    }
                }
            });
        });

    });
}

module.exports = VISIT_ROUTER;
