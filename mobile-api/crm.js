var mysql = require("mysql");
const isset = require('isset');
const pad = require('pad-left');
const moment = require('moment');

function CRM_ROUTER(router, pool) {
    var self = this;
    self.handleRoutes(router, pool);
}

CRM_ROUTER.prototype.handleRoutes = (router, pool) => {

    router.get("/competitors", (req, res) => {
        var data = {
            error: true,
            error_msg: ""
        };

        var query = `SELECT kode_competitor, nama_competitor FROM competitor WHERE status = 1`;
        query = mysql.format(query);
        pool.getConnection((err, connection) => {
            connection.query(query, (err, rows) => {
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
                        data.error_msg = 'No Competitors Found..';
                        res.json(data);
                    }
                }
            });
        });
    });
    
    router.post("/crm/report", (req, res) => {
        var data = {
            error: true,
            error_msg: ""
        };

        if (isset(req.body.kode_sales) && isset(req.body.nama_toko) && isset(req.body.pemilik)
            && isset(req.body.alamat)  && isset(req.body.any_competitors)
            && isset(req.body.omset_nippon) && isset(req.body.competitors)) {
            var query = `SELECT id FROM sales_crm WHERE kode_sales = ? AND nama_toko = UPPER(?)
                         AND tanggal = DATE(CONVERT_TZ(NOW(),@@session.time_zone,'+07:00'))`;
            var table = [req.body.kode_sales, req.body.nama_toko];
            query = mysql.format(query, table);
            pool.getConnection((err, connection) => {
                connection.query(query, (err, rows) => {
                    connection.release();
                    if (err) {
                        res.status(500);
                        data.error_msg = "Error executing MySQL query";
                        res.json(data);
                    } else {
                        if (rows.length > 0) {
                            res.status(404);
                            data.error_msg = 'CRM Already Submited..';
                            res.json(data);
                        } else {
                            query = `INSERT INTO sales_crm (kode_sales,tanggal,nama_toko,
                                    nama_pemilik,alamat,omset_nippon,any_competitor) 
                                    VALUES (?,CONVERT_TZ(NOW(),@@session.time_zone,'+07:00'),?,?,?,?,?)`;
                            table = [req.body.kode_sales, req.body.nama_toko, req.body.pemilik,
                                    req.body.alamat, req.body.omset_nippon, req.body.any_competitors];
                            query = mysql.format(query,table);
                            pool.getConnection((err,connection) => {
                                console.log(query);
                                connection.query(query, (err,results) => {
                                    connection.release();
                                    if (err) {
                                        res.status(500);
                                        data.error_msg = "Error executing MySQL query";
                                        res.json(data);
                                    } else {
                                        var kode_crm = 'CRM-' + (pad(results.insertId, 11, '0'));
							            query = `UPDATE sales_crm SET kode_crm = ? WHERE id = ?`;
								        table = [kode_crm,results.insertId];
							        	query = mysql.format(query,table);
							        	pool.getConnection((err,connection) => {
			    							connection.query(query,(err) => {
								        		connection.release();
	            								if (err) {
								        			res.status(500);
							                        data.error_msg = 'Error executing MySQL query';
							                        res.json(data);
								        		}else{
                                                    if (req.body.any_competitors == 0) {
                                                        res.status(200);
                                                        data.error = false;
                                                        data.error_msg = 'CRM succesfuly submited..';
                                                        res.json(data);
                                                    } else {   
                                                        var competitors = req.body.competitors;
                                                        var tanggal = moment().format('YYYY-MM-DD');

                                                        var jsonObj = JSON.parse(competitors);
                                                        var jsonArr = jsonObj['competitors'];
                                                        var inserts = [];

                                                        for (var i in jsonArr) {
                                                            var kode_competitor = jsonArr[i]['kode_competitor'];
                                                            var omset = jsonArr[i]['omset'];
                                                            inserts.push([kode_crm, tanggal, kode_competitor, omset]);
                                                        }

                                                        var query = `INSERT INTO omset_competitor (kode_crm, 
                                                                    tanggal, kode_competitor, omset) VALUES ?`;
                                                        var table = [inserts];
                                                        query = mysql.format(query, table);
                                                        pool.getConnection((err, connection) => {
                                                            connection.query(query, (err) => {
                                                                connection.release();
                                                                if (err) {
                                                                    console.log(err);
                                                                    res.status(500);
                                                                    data.error_msg = "Error executing MySQL query";
                                                                    res.json(data);
                                                                } else {
                                                                    res.status(200);
                                                                    data.error = false;
                                                                    data.error_msg = 'CRM succesfuly submited..';
                                                                    res.json(data);
                                                                }
                                                            });
                                                        });
                                                    }
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
            res.status(404);
            data.error_msg = 'Missing some params..';
            res.json(data);
        }
    });

    router.get("/crm/:kode_sales/:tanggal/:nama_toko", (req, res) => {
        var data = {
            error: true,
            error_msg: ""
        };

        var query = `SELECT kode_crm,nama_toko,nama_pemilik,alamat,omset_nippon,any_competitor
                    FROM sales_crm WHERE kode_sales = ? AND tanggal = ? AND nama_toko = UPPER(?)`;
        var table = [req.params.kode_sales, req.params.tanggal, req.params.nama_toko];
        query = mysql.format(query, table);
        pool.getConnection((err, connection) => {
            connection.query(query, (err, rows) => {
                connection.release();
                if (err) {
                    res.status(500);
                    data.error_msg = "Error executing MySQL query";
                    res.json(data);
                } else {
                    if (rows.length > 0) {
                        var history = rows[0];
                        if (rows[0].any_competitor === 0) {
                            res.status(200);
                            data.error = false;
                            data.error_msg = 'Success..';
                            data.history = history;
                            res.json(data);    
                        } else {
                            query = `SELECT nama_competitor, omset FROM omset_competitor oc LEFT JOIN
                                    competitor c ON c.kode_competitor = oc.kode_competitor WHERE kode_crm = ?`;
                            table = [rows[0].kode_crm];
                            query = mysql.format(query,table);
                            pool.getConnection((err,connection) => {
                                connection.query(query, (err, rows) => {
                                    connection.release();
                                    if (err) {
                                        res.status(500);
                                        data.error_msg = "Error executing MySQL query";
                                        res.json(data);
                                    } else {
                                        res.status(200);
                                        data.error = false;
                                        data.error_msg = 'Success..';
                                        data.history = history;
                                        data.history.competitors = rows;
                                        res.json(data); 
                                    }
                                });
                            });
                        }
                        
                    } else {
                        res.status(404);
                        data.error_msg = 'No History Found..';
                        res.json(data);
                    }
                }
            });
        });
    });
}

module.exports = CRM_ROUTER;
