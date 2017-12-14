var winston = require('winston')
var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({ filename: './logs/uploadUtil.log' })
  ]
});

var urltool = require('url');
var path = require('path');
var fs = require('fs');
var http = require('http');
var https = require('https');

// upload sermon to server
// parameters:
//	title
//	speaker
//	scripture (optional)
//	info (optional)
//	description (optional)
//	lang
//	url
// 	username
exports.upload = function(req, db, hostHttp, portHttp, callback) {
  logger.info("uploadUtil>> upload start...");

  var title = req.body.title;
  logger.info("title: " + title);
  var speaker = req.body.speaker;
  logger.info("speaker: " + speaker);
  var scripture = req.body.scripture;
  logger.info("scripture: " + scripture);
  var info = req.body.info;
  logger.info("info: " + info);
  var description = req.body.description;
  logger.info("description: " + description);
  var lang = req.body.lang;
  logger.info("lang: " + lang);
  var url = req.body.url;
  logger.info("url: " + url);
  var username = req.body.username;
  logger.info("username: " + username);

  var basename = path.basename(urltool.parse(url).pathname);
  logger.info("basename: " + basename);
  var filename = Date.now() + "_" + basename;
  logger.info("filename: " + filename);

  var filepathLocal = "upload/" + filename;
  var file = fs.createWriteStream(filepathLocal);
  if (url.indexOf("http://") == 0) {
	var request = http.get(url, function(response) {
		response.pipe(file);
	});
  } else if (url.indexOf("https://") == 0) {
	var request = https.get(url, function(response) {
		response.pipe(file);
	});
  } else {
	 logger.error("uploadUtil>> invalid url");
	 callback({"status": "upload failed, invalid url: " + url});
  }  

  var sermonJson = {};
  sermonJson["title"] = title;
  sermonJson["speaker"] = speaker;
  sermonJson["scripture"] = scripture;
  sermonJson["info"] = info;
  sermonJson["description"] = description;
  sermonJson["lang"] = lang;
  
  sermonJson["url"] = url;  
  sermonJson["filename"] = filename;
  var urlLocal = "http://" + hostHttp + ":" + portHttp + "/" + filepathLocal;
  logger.info("urlLocal: " + urlLocal);
  sermonJson["urlLocal"] = urlLocal;

  sermonJson["username"] = username;
  
  var datetime = new Date().getTime();
  datetime += 8 * 60 * 60 * 1000;
  var datetimehk = new Date(datetime);
  sermonJson["datetime"] = datetimehk;
  var datehk = "" + datetimehk.getFullYear() + "-" + (datetimehk.getMonth()+1) + "-" + datetimehk.getDate();
  sermonJson["date"] = datehk;

  var collection = db.collection("sermons");
  collection.insertOne(sermonJson, function(err, result) {
    if (err) throw err;
    logger.info("uploadUtil>> 1 sermon inserted");
  })

  callback({"status": "upload complete"});
}
