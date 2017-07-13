var express = require("express");
var morgan = require("morgan");
var cors = require("cors");
var mysql = require("mysql");
var bodyParser = require("body-parser");

const login = require("./login.js");
const visit = require("./visit.js");
const product = require("./product.js");
const notif = require("./notification");
const order = require("./order");
const crm = require("./crm");
const toko = require("./toko");

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
    app.use(morgan("combined"));
    app.use('/selfie', express.static('upload'));
    app.use(bodyParser.urlencoded({ limit: "50mb",extended: true }));
    app.use(bodyParser.json({limit: "50mb"}));
    var router = express.Router();
    app.use('/api', router);
    var login_router = new login(router, pool);
    var visit_router = new visit(router, pool);
    var product_router = new product(router,pool);
    var notif_router = new notif(router,pool);
    var order_router = new order(router,pool);
    var crm_router = new crm(router,pool);
    var toko_router = new toko(router,pool);
    // Handle 404 - Keep this as a last route
    app.use(function (req, res, next) {
        res.status(400);
        res.json({ "error": true, "error_msg": "Method Not Found" });
    });
    self.startServer();
}

REST.prototype.startServer = function () {
    app.listen(3002, function () {
        console.log("All right ! I am alive at Port 3002.");
    });
}

REST.prototype.stop = function (err) {
    console.log("ISSUE WITH MYSQL n" + err);
    process.exit(1);
}

new REST();
