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
var randomstring = require('randomstring');
var path = require('path');

var iSermonConfig = require('./iSermonConfig');
var translator = require('./translator');

var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  service: iSermonConfig.iSermonEmailProvider,
  auth: {
    user: iSermonConfig.iSermonEmailAccount,
    pass: iSermonConfig.iSermonEmailPassword
  }
});

// Obsolete
// upload sermon to server
// parameters:
//	title
//	speaker (obsolete)
//	scripture (obsolete)
//	info (obsolete)
//	description (optional)
//	lang (obsolete)
//	url (optional)
// 	username
exports.upload = function(req, db, hostHttp, portHttp, callback) {
  logger.info("uploadUtil>> upload start...");

  var title = req.body.title;
  title = translator.translate2(title);
  logger.info("title: " + title);
//  var speaker = req.body.speaker;
//  logger.info("speaker: " + speaker);
//  var scripture = req.body.scripture;
//  logger.info("scripture: " + scripture);
//  var info = req.body.info;
//  logger.info("info: " + info);
  var description = req.body.description;
  description = translator.translate2(description);
  logger.info("description: " + description);
//  var lang = req.body.lang;
//  logger.info("lang: " + lang);
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
//  sermonJson["speaker"] = speaker;
//  sermonJson["scripture"] = scripture;
//  sermonJson["info"] = info;
  sermonJson["description"] = description;
//  sermonJson["lang"] = lang;

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

  res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
  // res.writeHead(200, {'Content-Type': 'application/x-www-form-urlencoded'});
  res.write('<form action="fileupload" method="post" enctype="multipart/form-data" accept-charset="utf-8">');
  res.write('上傳講道錄音<br><br>');

  res.write('講題: <br>');
  res.write('<input type="text" name="title" placeholder="講道題目" size=40><br><br>');

  res.write('描述: <br>');
  // res.write('<input type="text" name="description" placeholder="Description" size=35><br><br>');
  res.write('<textarea name="description2" placeholder="說點什麼..." cols=40 rows=5></textarea><br><br>');

  res.write('從本地選擇講道錄音MP3文件: <br>');
  res.write('<input type="file" name="filetoupload" accept="audio/mp3"><br>');
  res.write('或者，指定講道錄音MP3下載鏈接: <br>');
  res.write('<input type="text" name="url" placeholder="下載鏈接URL" size=40><br><br>');

  res.write('用戶名和密碼 - 可留空並以訪客身份上傳: <br>');
  res.write('<input type="text" name="username" placeholder="用戶名（可選）" size=40><br>');
  res.write('<input type="password" name="password" placeholder="密碼（可選）" size=40><br><br>');

  res.write('<input type="submit">');
  res.write('</form>');
  return res.end();
}

exports.fileupload = function(req, res, db, hostHttp, portHttp, callback) {
  logger.info("uploadUtil>> fileupload start...");

  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
	  var title = fields.title;
	  title = translator.translate2(title);
	  logger.info("title: " + title);
    var description2 = fields.description2;
	description2 = translator.translate2(description2);
	  logger.info("description2: " + description2);
    var username = fields.username;
    var password = fields.password;
    logger.info("username: " + username + ", password: " + password);

    getUploadUsername(username, password, db, function(uploadUsername){
      var url = fields.url;
	  logger.info("url: " + url);
      var file = files.filetoupload;
	  logger.info("file: " + file.name);
      if (url != null && url != "") {
        uploadFromUrl(url, db, title, description2, uploadUsername, hostHttp, portHttp, function(result){
          logger.info("callback from uploadFromUrl, result: " + result);
          if(result == "success") {
            callback("Upload success.");
          } else {
            callback("Upload failure, invalid url: " + url);
          }
        });
      } else if (file.name != null && file.name != ""){
          uploadFromLocal(file, db, title, description2, uploadUsername,hostHttp, portHttp, function(result){
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
  });
}

function getUploadUsername(username, password, db, callback){
  logger.info("uploadUtil>> getUploadUsername start...");

  if (!username || !password){
        logger.info("invalid username or password, upload username: guest");
        callback("guest");
        return;
      };

  var collection = db.collection('users');
  var query = {username: username, password: password};
  logger.info("query: " + JSON.stringify(query));

  collection.find(query).toArray(function(err, results){
    if(results.length == 0){
      logger.info("username/password not found, upload username: guest");
      callback("guest");
    } else {
      logger.info("username/password found, upload username: " + username);
      callback(username);
    }
  });
}

function uploadFromUrl(url, db, title, description, uploadUsername, hostHttp, portHttp, callback) {
  logger.info("upload from URL: " + url);
  var basename = path.basename(urltool.parse(url).pathname);
  logger.info("basename: " + basename);
  
  var randomeFilename = randomstring.generate(7);
  var basenameNew = randomeFilename + path.extname(basename);
  logger.info("basenameNew: " + basenameNew);
  
  var filename = Date.now() + "_" + basenameNew;
  // logger.info("filename: " + filename);
  var filepathLocal = "upload/" + filename;
  logger.info("filepathLocal: " + filepathLocal);
  var urlLocal = "http://" + hostHttp + ":" + portHttp + "/" + filepathLocal;
  logger.info("urlLocal: " + urlLocal);

  var file = fs.createWriteStream("http/"+filepathLocal);
  if (url.indexOf("http://") == 0) {
    var request = http.get(url, function(response) {
      response.pipe(file);
      // res.write('File upload success!');
      // res.end();
      dbInsert(db, title, description, urlLocal, uploadUsername);
      callback("success");
    });
	request.on('error', function(err){
		logger.error("error when download from url: " + err);
		callback("upload failed, please check URL.");
	});
  } else if (url.indexOf("https://") == 0) {
      var request = https.get(url, function(response) {
        response.pipe(file);
        // res.write('File upload success!');
        // res.end();
        dbInsert(db, title, description, urlLocal, uploadUsername);
        callback("success");
      });
	request.on('error', function(err){
		logger.error("error when download from url: " + err);
		callback("upload failed, please check URL.");
	});
  } else {
     logger.error("uploadUtil>> invalid url");
     // res.write({"status": "upload failed, invalid url: " + url});
     // res.end();
     callback("failure");
  }
}

function uploadFromLocal(file, db, title, description, uploadUsername, hostHttp, portHttp, callback) {
  var oldpath = file.path;
  logger.info("upload from local, oldpath: " + oldpath);
  var basename = file.name;
  logger.info("basename: " + basename);
  
  var randomeFilename = randomstring.generate(7);
  var basenameNew = randomeFilename + path.extname(basename);
  logger.info("basenameNew: " + basenameNew);
  
  var filename = Date.now() + "_" + basenameNew;
  // logger.info("filename: " + filename);
  var filepathLocal = 'upload/' + filename;
  // logger.info("filepathLocal: " + filepathLocal);
  var urlLocal = "http://" + hostHttp + ":" + portHttp + "/" + filepathLocal;
  logger.info("urlLocal: " + urlLocal);

  fs.rename(oldpath, 'http/'+filepathLocal, function (err) {
    if (err) throw err;
    dbInsert(db, title, description, urlLocal, uploadUsername);
    callback("success");
  });
}

function dbInsert(db, title, description, urlLocal, uploadUsername){
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

    sermonJson["username"] = uploadUsername;

    sermonJson["num_listen"] = 0;
    sermonJson["num_like"] = 0;
    sermonJson["num_bookmark"] = 0;

    var collection = db.collection("sermons");
    collection.insertOne(sermonJson, function(err, result) {
      if (err) throw err;
      logger.info("uploadUtil>> 1 sermon inserted");
      sendEmailUploadSuccess(title, description, urlLocal, uploadUsername);
    })
}

function sendEmailUploadSuccess(title, description, urlLocal, uploadUsername){
  var from = iSermonConfig.iSermonEmailAccount;
  var to = iSermonConfig.iSermonEmailAccount;
  var subject = "iSermon: New Sermon Uploaded";
  var text = "";
  text += "Dear Admin, \n";
  text += "\n";
  text += "Below sermon has been added to server: \n";
  text += "\n";
  text += "Title: " +  "\n";
  text += title + "\n";
  text += "\n";
  text += "Description: " + "\n";
  text += description + "\n";
  text += "\n";
  text += "URL: " + "\n";
  text += urlLocal + "\n";
  text += "\n";
  text += "Uploaded By: " + "\n";
  text += uploadUsername + "\n";
  text += "\n";
  text += "Thank you. \n";
  text += "\n";
  text += "iSermon Team \n";

  var mailOptions = {
    from: from,
    to: to,
    subject: subject,
    text: text
  };
  logger.info("loginUtil>> mailOptions: " + JSON.stringify(mailOptions));

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      logger.info(error);
    } else {
      logger.info('loginUtil>> Email sent: ' + info.response);
    }
  });
}
