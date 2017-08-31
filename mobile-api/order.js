var mysql = require("mysql");
const isset = require('isset');
const pad = require('pad-left');
var replaceall = require("replaceall");
const nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'gmail',
    secure: false,
    port: 25,
    auth: {
        user: 'order.sal35@gmail.com',
        pass: 'NipponPaint1010$'
    },
    tls: {
        rejectUnauthorized: false
    }
});

function ORDER_ROUTER(router, pool) {
    var self = this;
    self.handleRoutes(router, pool);
}

ORDER_ROUTER.prototype.handleRoutes = function (router, pool) {

    router.post("/order/insert", function (req, res) {
        var data = {
            error: true,
            error_msg: ""
        };

        if (isset(req.body.kode_sales) && isset(req.body.nama_sales) && isset(req.body.nama_toko)
             && isset(req.body.kode_sap) && isset(req.body.message) && isset(req.body.depot)) {
            
            var query = `SELECT id FROM sales_order WHERE kode_sales = ? AND kode_sap = ?
                         AND tanggal = DATE(CONVERT_TZ(CURDATE(),@@session.time_zone,'+07:00'))`;
            var table = [req.body.kode_sales, req.body.kode_sap];
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
                            res.status(404);
                            data.error_msg = 'Order already submited..';
                            res.json(data);
                        } else {
                            var query = `INSERT INTO sales_order (kode_sales, tanggal, nama_toko, kode_sap, message) 
									    VALUES(?, CONVERT_TZ(NOW(),@@session.time_zone,'+07:00'), ?, ?, ?)`;
                            var table = [req.body.kode_sales, req.body.nama_toko, req.body.kode_sap, req.body.message];
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
                                        var kode_report = 'SPO-' + (pad(results.insertId, 11, '0'));
                                        var query = `UPDATE sales_order SET kode_order = ? WHERE id = ?`;
                                        var table = [kode_report, results.insertId];
                                        query = mysql.format(query, table);
                                        pool.getConnection(function (err, connection) {
                                            connection.query(query, function (err) {
                                                connection.release();
                                                if (err) {
                                                    res.status(500);
                                                    data.error_msg = "Error executing MySQL query";
                                                    res.json(data);
                                                } else {
                                                    var query = 'SELECT email FROM email_order WHERE depot = ?';
                                                    var table = [req.body.depot];
                                                    query = mysql.format(query,table);
                                                    pool.getConnection((err, connection) => {
                                                        connection.query(query, (err, rows) => {
                                                            connection.release();
                                                            var email;
                                                            if(err) {
                                                                email = 'error@gmail.com';
                                                            } else if (rows.length > 0){
                                                                email = rows[0].email;
                                                                console.log(email);
                                                            } else {
                                                                email = 'notfound@gmail.com'
                                                            }
                                                            var message = replaceall('\n','<br>',req.body.message);
                                                            console.log(email);
                                                            var mailOptions = {
                                                                from: 'Order Sales <order.sal35@gmail.com>',
                                                                to: email,
                                                                subject: kode_report,
                                                                html: `<p>Admin Order,</p>
                                                                        <p>You have product order from sales.</p>
                                                                        <table>
                                                                            <tr>
                                                                                <td>Kode Order</td>
                                                                                <td> : </td>
                                                                                <td>${kode_report}</td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td>Requestor</td>
                                                                                <td> : </td>
                                                                                <td>${req.body.nama_sales}</td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td>Nama Toko</td>
                                                                                <td> : </td>
                                                                                <td>${req.body.nama_toko}</td>
                                                                            </tr>
                                                                            <tr>
                                                                                <td>Kode SAP</td>
                                                                                <td> : </td>
                                                                                <td>${req.body.kode_sap}</td>
                                                                            </tr>
                                                                        </table>
                                                                        <p>Message (Order) :</p>
                                                                        <p>${message}</p>
                                                                        <p>Thanks,<br>Sales App</p>`
                                                            };
        
                                                            transporter.sendMail(mailOptions,(err,info)=> {
                                                                if (err) {
                                                                    console.log(err);
                                                                    res.status(200);
                                                                    data.error = false;
                                                                    data.error_msg = 'Order succesfuly submited..';
                                                                    res.json(data);
                                                                } else {
                                                                    console.log('Email sent sucessfuly..');
                                                                    res.status(200);
                                                                    data.error = false;
                                                                    data.error_msg = 'Order succesfuly sent..';
                                                                    res.json(data);
                                                                }
                                                            });
                                                        })
                                                    });
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
            res.status(400);
            data.error_msg = 'Missing some params..';
            res.json(data);
        }
    });

    router.get("/order/:kode_sales/:tanggal", function (req, res) {
        var data = {
            error: true,
            error_msg: ""
        };

        var query = `SELECT kode_order,DATE_FORMAT(tanggal, '%d-%m-%Y')
                    as tanggal, nama_toko, kode_sap, message, status
        			FROM sales_order WHERE kode_sales = ? AND tanggal = ?`;
        var table = [req.params.kode_sales, req.params.tanggal];
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

    router.put("/order/update", function (req, res) {
        var data = {
            error: true,
            error_msg: ""
        };

        if (isset(req.body.kode_order) && isset(req.body.message)) {
            
            var query = `UPDATE sales_order SET message = ? WHERE kode_order = ?`;
            var table = [req.body.message, req.body.kode_order];
            query = mysql.format(query, table);
            pool.getConnection(function (err, connection) {
                connection.query(query, function (err) {
                    connection.release();
                    if (err) {
                        res.status(500);
                        data.error_msg = "Error executing MySQL query";
                        res.json(data);
                    } else {
                        res.status(200);
                        data.error = false;
                        data.error_msg = 'Order succesfuly updated..';
                        res.json(data);
                    }
                });
            });
        } else {
            res.status(400);
            data.error_msg = 'Missing some params..';
            res.json(data);
        }
    });
}

module.exports = ORDER_ROUTER;
