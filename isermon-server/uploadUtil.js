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
var formidable = require('formidable');
var fs = require('fs');

// Obsolete
// upload sermon to server
// parameters:
//	title
//	speaker (optional)
//	scripture (optional)
//	info (optional)
//	description (optional)
//	lang (optional)
//	url (optional)
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

exports.getUpload = function (req, res) {
  logger.info("uploadUtil>> getUpload start...");

  res.writeHead(200, {'Content-Type': 'text/html'});
  // res.writeHead(200, {'Content-Type': 'application/x-www-form-urlencoded'});
  res.write('<form action="fileupload" method="post" enctype="multipart/form-data" accept-charset="utf-8">');
  res.write('Upload Sermon Recording<br><br>');

  res.write('Sermon title: <br>');
  res.write('<input type="text" name="title" placeholder="Title" size=40><br><br>');

  res.write('Sermon description: <br>');
  // res.write('<input type="text" name="description" placeholder="Description" size=35><br><br>');
  res.write('<textarea name="description2" placeholder="Description" cols=40 rows=5></textarea><br><br>');

  res.write('Choose local mp3 file: <br>');
  res.write('<input type="file" name="filetoupload" accept="audio/mp3"><br>');
  res.write('Or upload mp3 from Internet: <br>');
  res.write('<input type="text" name="url" placeholder="URL" size=40><br><br>');

  res.write('<input type="submit">');
  res.write('</form>');
  return res.end();
}

exports.fileupload = function(req, res, db, hostHttp, portHttp, callback) {
  logger.info("uploadUtil>> fileupload start...");

  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
	  var title = fields.title;
	  logger.info("title: " + title);
	  // var description = fields.description;
	  // logger.info("description: " + description);
    var description2 = fields.description2;
	  logger.info("description2: " + description2);

    var url = fields.url;
    var file = files.filetoupload;
    if (url != null && url != "") {
      uploadFromUrl(url, db, title, description2, hostHttp, portHttp, function(result){
        logger.info("callback from uploadFromUrl, result: " + result);
        if(result == "success") {
          callback("Upload success.");
        } else {
          callback("Upload failure, invalid url: " + url);
        }
      });
    } else if (file.name != null && file.name != ""){
        uploadFromLocal(file, db, title, description2, hostHttp, portHttp, function(result){
          if(result == "success"){
            callback("Upload success.");
          } else {
            callback("Upload failure, cannot read file: " + file.name);
          }
        });
    } else {
        callback("Upload failure: either choose a local file or input valid URL.");
    }
  });
}

function uploadFromUrl(url, db, title, description, hostHttp, portHttp, callback) {
  logger.info("upload from URL: " + url);
  var basename = path.basename(urltool.parse(url).pathname);
  logger.info("basename: " + basename);
  var filename = Date.now() + "_" + basename;
  // logger.info("filename: " + filename);
  var filepathLocal = "upload/" + filename;
  logger.info("filepathLocal: " + filepathLocal);
  var urlLocal = "http://" + hostHttp + ":" + portHttp + "/" + filepathLocal;
  logger.info("urlLocal: " + urlLocal);

  var file = fs.createWriteStream(filepathLocal);
  if (url.indexOf("http://") == 0) {
    var request = http.get(url, function(response) {
      response.pipe(file);
      // res.write('File upload success!');
      // res.end();
      dbInsert(db, title, description, urlLocal);
      callback("success");
    });
  } else if (url.indexOf("https://") == 0) {
      var request = https.get(url, function(response) {
        response.pipe(file);
        // res.write('File upload success!');
        // res.end();
        dbInsert(db, title, description, urlLocal);
        callback("success");
      });
  } else {
     logger.error("uploadUtil>> invalid url");
     // res.write({"status": "upload failed, invalid url: " + url});
     // res.end();
     callback("failure");
  }
}

function uploadFromLocal(file, db, title, description, hostHttp, portHttp, callback) {
  var oldpath = file.path;
  logger.info("upload from local, oldpath: " + oldpath);
  var basename = file.name;
  logger.info("basename: " + basename);
  var filename = Date.now() + "_" + basename;
  // logger.info("filename: " + filename);
  var filepathLocal = 'upload/' + filename;
  // logger.info("filepathLocal: " + filepathLocal);
  var urlLocal = "http://" + hostHttp + ":" + portHttp + "/" + filepathLocal;
  logger.info("urlLocal: " + urlLocal);

  fs.rename(oldpath, filepathLocal, function (err) {
    if (err) throw err;
    dbInsert(db, title, description, urlLocal);
    callback("success");
  });
}

function dbInsert(db, title, description, urlLocal){
    logger.info("uploadUtil>> dbInsert start...");

    var sermonJson = {};
    sermonJson["title"] = title;
    sermonJson["description"] = description;
    sermonJson["urlLocal"] = urlLocal;

    var datetime = new Date().getTime();
    datetime += 8 * 60 * 60 * 1000;
    var datetimehk = new Date(datetime);
    sermonJson["datetime"] = datetimehk;
    var datehk = "" + datetimehk.getFullYear() + "-" + (datetimehk.getMonth()+1) + "-" + datetimehk.getDate();
    sermonJson["date"] = datehk;

    sermonJson["username"] = "guest"; //temporary

    var collection = db.collection("sermons");
    collection.insertOne(sermonJson, function(err, result) {
      if (err) throw err;
      logger.info("uploadUtil>> 1 sermon inserted");
    })
}
