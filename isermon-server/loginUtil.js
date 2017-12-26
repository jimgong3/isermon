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

  res.writeHead(200, {'Content-Type': 'text/html'});
  res.write('<form action="registerByForm" method="post" enctype="multipart/form-data" accept-charset="utf-8">');

  res.write('New User Registration<br><br>');
  res.write('Username: <br>');
  res.write('<input type="text" name="username" placeholder="Username" size=40><br><br>');
  res.write('Password: <br>');
  res.write('<input type="password" name="password" placeholder="Password" size=40><br><br>');
  res.write('Email: <br>');
  res.write('<input type="text" name="email" placeholder="Email (optional)" size=40><br><br>');

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
  var subject = "iSermon: Register Success";
  var text = "";
  text += "Dear Customer, \n\nThanks for your registration, below please find the user account details for your reference: "
  text += "\n\nUsername: " + username;
  text += "\nEmail: " + email;
  text += "\n\nFeel free to let us know for any comment or thought of this app.";
  text += "\n\nThank you.";
  text += "\n\niSermon Team";

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
