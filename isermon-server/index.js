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
var loginUtil = require('./loginUtil');
var bookmarkUtil = require('./bookmarkUtil');
var likeUtil = require('./likeUtil');

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

// var hostHttp = "localhost";
var hostHttp = "52.221.212.21";
var portHttp = "8080";

var port = 4001;
app.listen(port, function () {
  logger.info("index>> server listening on port " + port);
});

app.get('/', function (req, res) {
  logger.info("index>> GET /");
  res.json({"name": "isermon", "vision": "connect people with sermons."});
})

//Obsolete, replaced by POST fileupload
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
  uploadUtil.getUpload(req, res);
})

app.post('/fileupload', function (req, res) {
  logger.info("index>> POST /fileupload");
  uploadUtil.fileupload(req, res, db, hostHttp, portHttp, function(result){
    res.write(result, function(err){
      res.end();
    });
  });
  // var form = new formidable.IncomingForm();
  // form.parse(req, function (err, fields, files) {
	//   var title = fields.title;
	//   logger.info("title: " + title);
	//   var description = fields.description;
	//   logger.info("description: " + description);
  //     var oldpath = files.filetoupload.path;
	//   logger.info("oldpath: " + oldpath);
  //     var newpath = 'upload/' + files.filetoupload.name;
	//   logger.info("newpath: " + newpath);
  //     fs.rename(oldpath, newpath, function (err) {
  //       if (err) throw err;
  //       res.write('File uploaded and moved!');
  //       res.end();
	//   });
  // });
})

app.get('/register', function (req, res) {
  logger.info("index>> GET /register");
  loginUtil.getRegister(req, res);
})

app.post('/registerByForm', function(req, res){
  logger.info("index>> POST /registerByForm");
  loginUtil.registerByForm(req, db, function(result){
    res.write(result);
    res.end();
  });
})

app.post('/registerByJson', function(req, res){
  logger.info("index>> POST /registerByJson");
  loginUtil.registerByJson(req, db, function(result){
    res.write(result);
    res.end();
  });
})

app.get('/login', function (req, res) {
  logger.info("index>> GET /login");
  loginUtil.getLogin(req, res);
})

app.post('/loginByForm', function(req, res){
  logger.info("index>> POST /loginByForm");
  loginUtil.loginByForm(req, db, function(result){
    res.write(result);
    res.end();
  });
})

app.post('/loginByJson', function(req, res){
  logger.info("index>> POST /loginByJson");
  loginUtil.loginByJson(req, db, function(result){
    res.write(result);
    res.end();
  });
})

app.get('/bookmarks', function (req, res) {
  logger.info("index>> GET /bookmarks");
  bookmarkUtil.bookmarks(req, db, function(result) {
    res.json(result);
  });
})

app.post('/bookmarkSermon', function (req, res) {
  logger.info("index>> POST /bookmarkSermon");
  bookmarkUtil.bookmarkSermon(req, db, function(result) {
    res.json(result);
  });
})

app.post('/unbookmarkSermon', function (req, res) {
  logger.info("index>> POST /unbookmarkSermon");
  bookmarkUtil.unbookmarkSermon(req, db, function(result) {
    res.json(result);
  });
})

app.get('/likes', function (req, res) {
  logger.info("index>> GET /likes");
  likeUtil.likes(req, db, function(result) {
    res.json(result);
  });
})

app.post('/likeSermon', function (req, res) {
  logger.info("index>> POST /likeSermon");
  likeUtil.likeSermon(req, db, function(result) {
    res.json(result);
  });
})

app.post('/unlikeSermon', function (req, res) {
  logger.info("index>> POST /unlikeSermon");
  likeUtil.unlikeSermon(req, db, function(result) {
    res.json(result);
  });
})

app.post('/addSermonListenCount', function (req, res) {
  logger.info("index>> POST /addSermonListenCount");
  sermonsUtil.addSermonListenCount(req, db, function(result) {
    res.json(result);
  });
})
