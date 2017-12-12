var app = require('express')();
var pretty = require('express-prettify');
var winston = require('winston')
var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({ filename: './logs/index.log' })
  ]
});
var uploadUtil = require('./uploadUtil');
var sermonsUtil = require('./sermonsUtil');

var db;
var mongoUtil = require('./mongoUtil');
mongoUtil.connectToServer( function(err){
	logger.info("index>> connected to mongodb server success")
	db = mongoUtil.getDb();
});

app.use(pretty({ query: 'pretty' }));

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var hostHttp = "localhost";
var portHttp = "8080";

var port = 4001;
app.listen(port, function () {
  logger.info("index>> server listening on port " + port);
});

app.get('/', function (req, res) {
  logger.info("index>> GET /");
  res.json({"name": "isermon", "vision": "connect people with sermons."});
})

app.post('/upload', function (req, res) {
  logger.info("index>> POST /upload");
  uploadUtil.upload(req, db, hostHttp, portHttp, function(result) {
    res.json(result);
    logger.info("index>> POST /upload complete");
  })
})

app.get('/sermons', function (req, res) {
  logger.info("index>> GET /sermons");
  sermonsUtil.sermons(req, db, function(result) {
    res.json(result);
    logger.info("index>> GET /sermons complete");
  })
})
