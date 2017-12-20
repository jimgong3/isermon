var app = require('express')();
var pretty = require('express-prettify');
var winston = require('winston')
var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({ filename: './logs/index.log' })
  ]
});
var formidable = require('formidable');
var fs = require('fs');

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

app.get('/upload', function (req, res) {
  logger.info("index>> GET /upload");
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write('<form action="fileupload" method="post" enctype="multipart/form-data">');
  res.write('<input type="text" name="title" value="title"><br><br>');
  res.write('<input type="text" name="description" value="write something about it..."><br><br>');
  res.write('<input type="file" name="filetoupload"><br><br>');
  res.write('<input type="submit">');
  res.write('</form>');
  return res.end();
})

app.post('/fileupload', function (req, res) {
  logger.info("index>> POST /fileupload");
  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
	  var title = fields.title;
	  logger.info("title: " + title);
	  var description = fields.description;
	  logger.info("description: " + description);
      var oldpath = files.filetoupload.path;
	  logger.info("oldpath: " + oldpath);
      var newpath = 'upload/' + files.filetoupload.name;
	  logger.info("newpath: " + newpath);
      fs.rename(oldpath, newpath, function (err) {
        if (err) throw err;
        res.write('File uploaded and moved!');
        res.end();
	  });
  });
})

