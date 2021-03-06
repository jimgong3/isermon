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
	 //todo: delete the empty file
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
  res.write('<h1>上傳講道錄音</h1>');

  res.write('講題: <br>');
  res.write('<input type="text" name="title" placeholder="講道題目" size=40><br><br>');

  res.write('描述: <br>');
  // res.write('<input type="text" name="description" placeholder="Description" size=35><br><br>');
  res.write('<textarea name="description2" placeholder="說點什麼..." cols=40 rows=5></textarea><br><br>');

  res.write('從本地選擇講道錄音MP3文件: <br>');
  res.write('<input type="file" name="filetoupload" accept="audio/mp3"><br>');
  res.write('或者，指定講道錄音MP3下載鏈接URL: <br>');
  res.write('<input type="text" name="url" placeholder="e.g. http://wwww.website.org/recording.mp3" size=40><br><br>');

  res.write('用戶名和密碼（可選，留空以訪客身份上傳）: <br>');
  res.write('<input type="text" name="username" placeholder="用戶名（可選）" size=40><br>');
  res.write('<input type="password" name="password" placeholder="密碼（可選）" size=40><br><br>');

  res.write('<input type="submit">');
  res.write('</form>');
  return res.end();
}

exports.getUploadSudo = function (req, res) {
  logger.info("uploadUtil>> getUpload start...");

  res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
  // res.writeHead(200, {'Content-Type': 'application/x-www-form-urlencoded'});
  res.write('<form action="fileupload" method="post" enctype="multipart/form-data" accept-charset="utf-8">');
  res.write('<h1>上傳講道錄音 Sudo</h1>');

  res.write('講題: <br>');
  res.write('<input type="text" name="title" placeholder="講道題目" size=40><br><br>');

  res.write('描述: <br>');
  // res.write('<input type="text" name="description" placeholder="Description" size=35><br><br>');
  res.write('<textarea name="description2" placeholder="說點什麼..." cols=80 rows=10></textarea><br><br>');

  res.write('講道錄音MP3下載鏈接URL: <br>');
  res.write('<input type="text" name="url" placeholder="e.g. http://wwww.website.org/recording.mp3" size=80><br><br>');

  res.write('管理員密碼: <br>');
  res.write('<input type="password" name="adminPassword" placeholder="" size=40><br><br>');

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

    var adminPassword = fields.adminPassword;
    logger.info("adminPassword: " + adminPassword);
    if(adminPassword){
      if(adminPassword == iSermonConfig.adminPassword){
        logger.info("sudo mode on");
        var url = fields.url;
  	    logger.info("url: " + url);
        var isSudo = true;
        var uploadUsername = "guest";
        uploadFromUrl(url, db, title, description2, uploadUsername, hostHttp, portHttp, isSudo, function(result){
          logger.info("callback from uploadFromUrl, result: " + result);
          callback(result);
        });
      } else {
        logger.error("incorrect admin password");
        callback("incorrect admin password");
      }
      return;
    }

    var isSudo = false;
    logger.info("sudo mode off");
    getUploadUsername(username, password, db, function(uploadUsername){
      var url = fields.url;
	    logger.info("url: " + url);
      var file = files.filetoupload;
      if(file)
	      logger.info("file: " + file.name);
      if (url != null && url != "") {
        uploadFromUrl(url, db, title, description2, uploadUsername, hostHttp, portHttp, isSudo, function(result){
          logger.info("callback from uploadFromUrl, result: " + result);
          callback(result);
        });
      } else if (file && file.name != null && file.name != ""){
          uploadFromLocal(file, db, title, description2, uploadUsername,hostHttp, portHttp, function(result){
			      logger.info("callback from uploadFromLocal, result: " + result);
			      callback(result);
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

function uploadFromUrl(url, db, title, description, uploadUsername, hostHttp, portHttp, isSudo, callback) {
  logger.info("upload from URL: " + url);
  if(isSudo)
    logger.info("sudo mode on");
  else
    logger.info("sodu mode off");

  var basename = path.basename(urltool.parse(url).pathname);
  logger.info("basename: " + basename);

  var randomeFilename = randomstring.generate(7);
  var basenameNew = randomeFilename + path.extname(basename);
  logger.info("basenameNew: " + basenameNew);

  if (path.extname(basename) != ".mp3"){
	  callback("Upload failure - currently only mp3 file format is supported");
	  return;
  }

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
      dbInsert(db, title, description, urlLocal, url, uploadUsername, isSudo);
      if(isSudo)
        callback("Upload and approve success.");
      else
        callback("Upload success, pending for review.");
    });
	  request.on('error', function(err){
  		logger.error("error when download from url: " + err);
  		callback("Upload failed, please check URL.");
	  });
  } else if (url.indexOf("https://") == 0) {
      var request = https.get(url, function(response) {
        response.pipe(file);
        // res.write('File upload success!');
        // res.end();
        dbInsert(db, title, description, urlLocal, url, uploadUsername, isSudo);
        if(isSudo)
          callback("Upload and approve success.");
        else
          callback("Upload success, pending for review.");
      });
	    request.on('error', function(err){
		    logger.error("error when download from url: " + err);
		    callback("Upload failed, please check URL.");
	    });
  } else {
     logger.error("uploadUtil>> invalid url");
     // res.write({"status": "upload failed, invalid url: " + url});
     // res.end();
     callback("Upload failure, invalid url: " + url);
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
    var isSudo = false;
    dbInsert(db, title, description, urlLocal, null, uploadUsername, isSudo);
    callback("Upload success, pending for review.");
  });
}

function dbInsert(db, title, description, urlLocal, urlSource, uploadUsername, isSudo){
    logger.info("uploadUtil>> dbInsert start...");
    if(isSudo)
      logger.info("sudo mode on");
    else
      logger.info("sudo mode off");

    var sermonJson = {};
    sermonJson["title"] = title;
    sermonJson["description"] = description;
    sermonJson["urlLocal"] = urlLocal;
    sermonJson["urlSource"] = urlSource;

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
    sermonJson["num_download"] = 0;

    if(isSudo)
      sermonJson["status"] = "approved";
    else
      sermonJson["status"] = "pending for review";

    var collection = db.collection("sermons");
    collection.insertOne(sermonJson, function(err, result) {
      if (err) throw err;
      logger.info("uploadUtil>> 1 sermon inserted");
      sendEmailUploadSuccess(title, description, urlLocal, uploadUsername, sermonJson["_id"]);
    })
}

function sendEmailUploadSuccess(title, description, urlLocal, uploadUsername, oid){
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
  text += "Sermon ID: " + "\n";
  text += oid + "\n";
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
