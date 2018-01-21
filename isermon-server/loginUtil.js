var winston = require('winston')
var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({ filename: './logs/loginUtil.log' })
  ]
});

var iSermonConfig = require('./iSermonConfig');

var formidable = require('formidable');
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  service: iSermonConfig.iSermonEmailProvider,
  auth: {
    user: iSermonConfig.iSermonEmailAccount,
    pass: iSermonConfig.iSermonEmailPassword
  }
});


exports.getRegister = function (req, res) {
  logger.info("loginUtil>> getRegister start...");

  res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
  res.write('<form action="registerByForm" method="post" enctype="multipart/form-data" accept-charset="utf-8">');

  res.write('<h1>註冊新用戶</h1>');
  res.write('用戶名: <br>');
  res.write('<input type="text" name="username" placeholder="請輸入用戶名" size=40><br><br>');
  res.write('密碼: <br>');
  res.write('<input type="password" name="password" placeholder="請輸入密碼" size=40><br><br>');
  res.write('電子郵件Email（可選）: <br>');
  res.write('<input type="text" name="email" placeholder="Email可用作找回密碼" size=40><br><br>');

  res.write('<input type="submit">');
  res.write('</form>');

  return res.end();
}

exports.registerByForm = function(req, db, callback) {
  logger.info("loginUtil>> registerByForm start...");

  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    var username = fields.username;
    logger.info("username: " + username);
    var password = fields.password;
    logger.info("password: " + password);
    var email = fields.email;
    logger.info("email: " + email);

    register(username, password, email, db, function(result){
      callback(result);
    });
  });
}

exports.registerByJson = function(req, db, callback) {
  logger.info("loginUtil>> registerByJson start...");

  var username = req.body.username;
  logger.info("username: " + username );
  var password = req.body.password;
  logger.info("password: " + password);
  var email = req.body.email;
  logger.info("email: " + email);

  register(username, password, email, db, function(result){
    callback(result);
  });
}

function register(username, password, email, db, callback){
  logger.info("loginUtil>> register start...");

  if(username != null && username != "" && password != null && password != "") {
    var collection = db.collection('users');
    var query = {username: username};
    logger.info("loginUtil>> query: " + JSON.stringify(query));

    collection.find(query).toArray(function(err, docs) {
      if(docs.length > 0){
        logger.error("loginUtil>> error: username already exist, return empty");
        callback("Register fail: username already exist");
      } else {
          var userJson = {};
          userJson.username = username;
          userJson.password = password;  //use password2 for encrypted password
          userJson.email = email;

          collection.insertOne(userJson, function(err, docs) {
            logger.info("loginUtil>> 1 user inserted");
            callback("Register success.");
            if(email != null && email != "") {
              sendEmailRegisterSuccess(username, email);
            } else {
              logger.info("error: invalid email, skip sending email.");
            }
        });
      }
    });
  } else {
    callback("Register fail: please input valid username and password.");
  }
}

function sendEmailRegisterSuccess(username, email){
  var from = iSermonConfig.iSermonEmailAccount;
  var to = email;
  var cc = iSermonConfig.iSermonEmailAccount;
  var subject = "聽道: 註冊成功";
  var text = "";
  text += "親愛的用戶, \n"
  text += "\n"
  text += "感謝您的註冊，下面是您的用戶資料供參考： \n"
  text += "\n"
  text += "用戶名: " + username + "\n";
  text += "電郵: " + email + "\n";
  text += "\n"
  text += "如果對於聽道App有任何意見或者反饋，歡迎隨時告訴我們. \n";
  text += "\n"
  text += "謝謝您的支持. \n";
  text += "\n"
  text += "聽道App同工";

  var mailOptions = {
    from: from,
    to: to,
    cc: cc,
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

exports.getLogin = function (req, res) {
  logger.info("loginUtil>> getLogin start...");

  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write('<form action="loginByForm" method="post" enctype="multipart/form-data" accept-charset="utf-8">');

  res.write('User Login<br><br>');
  res.write('Username: <br>');
  res.write('<input type="text" name="username" placeholder="Username" size=40><br><br>');
  res.write('Password: <br>');
  res.write('<input type="password" name="password" placeholder="Password" size=40><br><br>');

  res.write('<input type="submit">');
  res.write('</form>');

  return res.end();
}

exports.loginByForm = function(req, db, callback) {
  logger.info("loginUtil>> loginByForm start...");

  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
    var username = fields.username;
    logger.info("username: " + username);
    var password = fields.password;
    logger.info("password: " + password);

    login(username, password, db, function(result){
      callback(result);
    });
  });
}

exports.loginByJson = function(req, db, callback) {
  logger.info("loginUtil>> loginByJson start...");

  var username = req.body.username;
  logger.info("username: " + username );
  var password = req.body.password;
  logger.info("password: " + password);

  login(username, password, db, function(result){
    callback(result);
  });
}

function login(username, password, db, callback){
  logger.info("loginUtil>> login start...");

  var collection = db.collection('users');
  var query = {username: username, password: password};
  logger.info("loginUtil>> query: " + JSON.stringify(query));

  collection.find(query).toArray(function(err, docs) {
    logger.info("loginUtil>> result: " + JSON.stringify(docs));
    if(docs.length > 0) {
      callback("Login success.");
    } else {
      callback("Login fail, please check username and password.");
    }
  });
}
