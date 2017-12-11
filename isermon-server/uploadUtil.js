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

exports.upload = function(req, db, callback) {
	logger.info("uploadUtil>> upload start...");

  var title = req.body.title;
  logger.info("title: " + title);
  var speaker = req.body.speaker;
  logger.info("speaker: " + speaker);
  var scripture = req.body.scripture;
  logger.info("scripture: " + scripture);
  var intro = req.body.intro;
  logger.info("intro: " + intro);
  var lang = req.body.lang;
  logger.info("lang: " + lang);
  var url = req.body.url;
  logger.info("url: " + url);

  var basename = path.basename(urltool.parse(url).pathname);
  logger.info("basename: " + basename);
  var filename = Date.now() + "_" + basename;
  logger.info("filename: " + filename);

  var file = fs.createWriteStream("upload/" + filename);
  var request = http.get(url, function(response) {
    response.pipe(file);
  });

  var sermonJson = {};
  sermonJson["title"] = title;
  sermonJson["speaker"] = speaker;
  sermonJson["scripture"] = scripture;
  sermonJson["intro"] = intro;
  sermonJson["lang"] = lang;
  sermonJson["url"] = url;
  sermonJson["filename"] = filename;

  var collection = db.collection("sermons");
  collection.insertOne(sermonJson, function(err, result) {
    if (err) throw err;
    logger.info("uploadUtil>> new sermon inserted: " + JSON.stringify(sermonJson));
  })

  callback({"status": "upload complete"});
}
