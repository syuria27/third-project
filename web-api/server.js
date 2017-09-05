var express = require("express");
var morgan = require("morgan");
var cors = require("cors");
var mysql = require("mysql");
var bodyParser = require("body-parser");

const login = require("./login.js");
const user = require("./user.js");
const product = require("./product.js");
const pdf = require("./pdf.js");
const fcm = require("./fcm.js");
const visit = require("./visit.js");
const sales = require("./sales.js");
const crm = require("./crm.js");
const report = require("./report.js");
const email = require("./email.js");
const order = require("./order.js");

var app = express();

function REST() {
    var self = this;
    self.connectMysql();
};

REST.prototype.connectMysql = function () {
    var self = this;
    var pool = mysql.createPool({
        connectionLimit: 50,
        waitForConnection: true,
        host: 'localhost',
        user: 'root',
        password: 'npspg2017',
        database: 'npsales',
        debug: false
    });
    self.configureExpress(pool);
}

REST.prototype.configureExpress = function (pool) {
    var self = this;
    app.use(cors());
    app.use(morgan("combined"))
    app.use(bodyParser.urlencoded({ limit: "50mb",extended: true, parameterLimit: 1000000 }));
    app.use(bodyParser.json({limit: "50mb"}));
    app.use('/pdf', express.static('uploads'));
    var router = express.Router();
    app.use('/api', router);
    var login_router = new login(router, pool);
    var sales_router = new sales(router, pool);
    var user_router = new user(router, pool);
    var product_router = new product(router,pool);
    var pdf_router = new pdf(router);
    var fcm_router = new fcm(router,pool);
    var visit_router = new visit(router, pool);
    var crm_router = new crm(router,pool);
    var report_router = new report(router,pool);
    var email_router = new email(router,pool);
    var order_router = new order(router,pool);
    // Handle 404 - Keep this as a last route
    app.use(function (req, res, next) {
        res.status(400);
        res.json({ "error": true, "error_msg": "Method Not Found" });
    });
    self.startServer();
}

REST.prototype.startServer = function () {
    app.listen(3003, function () {
        console.log("All right ! I am alive at Port 3003.");
    });
}

REST.prototype.stop = function (err) {
    console.log("ISSUE WITH MYSQL n" + err);
    process.exit(1);
}

new REST();
