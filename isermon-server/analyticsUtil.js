var winston = require('winston')
var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({ filename: './logs/analyticsUtil.log' })
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

exports.report = function (req, db, callback) {
  logger.info("analyticsUtil>> report start...");

  var rptJson = {};

  var datetime = new Date().getTime();
  datetime += 8 * 60 * 60 * 1000;
  var datetimehk = new Date(datetime);
  rptJson["datetime"] = datetimehk;
  var datehk = "" + datetimehk.getFullYear() + "-" + (datetimehk.getMonth()+1) + "-" + datetimehk.getDate();
  rptJson["date"] = datehk;

  rptJson["total_num_sermon_listen"] = 0;
  rptJson["total_num_sermon_like"] = 0;
  rptJson["total_num_sermon_bookmark"] = 0;
  rptJson["total_num_registered_users"] = 0;

  var sermosColl = db.collection("sermons");
  sermosColl.find().forEach(function(doc){
    logger.info("get sermon: " + doc["_id"]);
    rptJson["total_num_sermon_listen"] += doc["num_listen"];
    rptJson["total_num_sermon_like"] += doc["num_like"];
    rptJson["total_num_sermon_bookmark"] += doc["num_bookmark"];
  }, function(err){
    var usersColl = db.collection("users");
    usersColl.find().forEach(function(doc){
      logger.info("get user: " + doc["_id"]);
      rptJson["total_num_registered_users"] += 1;
    }, function(err){
      logger.info("done: " + JSON.stringify(rptJson));
      var analyticsColl = db.collection("analytics");
      analyticsColl.insertOne(rptJson, function(err, docs){
        logger.info("1 analytic record inserted");
        callback(rptJson);
        sendEmail(rptJson);
      });
    });
  });
}


function sendEmail(rptJson){
  logger.info("analyticsUtil>> sendEmail start...");

  var from = iSermonConfig.iSermonEmailAccount;
  var to = iSermonConfig.iSermonEmailAccount;
  var subject = "聽道App: Daily Analytics Report";
  var text = "";
  text += "親愛的Admin, \n"
  text += "\n"
  text += "Date: " + rptJson["date"] + " \n"
  text += "\n"
  text += "-- All Sermons --\n"
  text += "Total # of listen: " + rptJson["total_num_sermon_listen"] + "\n";
  text += "Total # of like: " + rptJson["total_num_sermon_like"] + "\n";
  text += "Total # of bookmark: " + rptJson["total_num_sermon_bookmark"] + "\n";
  text += "\n"
  text += "-- Registered Users --\n"
  text += "Total # of registered users: " + rptJson["total_num_registered_users"] + "\n";
  text += "\n"
  text += "聽道App同工";

  var mailOptions = {
    from: from,
    to: to,
    subject: subject,
    text: text
  };
  logger.info("mailOptions: " + JSON.stringify(mailOptions));

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      logger.info(error);
    } else {
      logger.info('Email sent: ' + info.response);
    }
  });
}
