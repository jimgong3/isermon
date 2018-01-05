var winston = require('winston')
var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({ filename: './logs/auditUtil.log' })
  ]
});

var iSermonConfig = require('./iSermonConfig');

var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
  service: iSermonConfig.iSermonEmailProvider,
  auth: {
    user: iSermonConfig.iSermonEmailAccount,
    pass: iSermonConfig.iSermonEmailPassword
  }
});

exports.audit = function(req, db, callback) {
	logger.info("auditUtil>> audit start...");

	var username = req.body.username;
	logger.info("username: " + username );
	var action = req.body.action;
	logger.info("action: " + action);
	var remarks1 = req.body.remarks1;
	logger.info("remarks1: " + remarks1);
	var remarks2 = req.body.remarks2;
	logger.info("remarks2: " + remarks2);
	var remarks3 = req.body.remarks3;
	logger.info("remarks3: " + remarks3);

  	var json = {};
	json.username = username;
	json.action = "download";
	json.remarks1 = remarks1;
	json.remarks2 = remarks2;
	json.remarks3 = remarks3;
	
	var datetime = new Date().getTime();
	datetime += 8 * 60 * 60 * 1000;
	var datetimehk = new Date(datetime);
	json["datetime"] = datetimehk;
	var datehk = "" + datetimehk.getFullYear() + "-" + (datetimehk.getMonth()+1) + "-" + datetimehk.getDate();
	json["date"] = datehk;

	logger.info("audit record: " + JSON.stringify(json));
	
	var collection = db.collection("audit");
	collection.insertOne(json, function(err, docs) {
		logger.info("1 audit record inserted");
		callback("success");
		sendEmailDownloadRequest(username, remarks1, remarks2, remarks3);
	});
}

function sendEmailDownloadRequest(username, remarks1, remarks2, remarks3){
  logger.info("auditUtil>> sendEmailDownloadRequest start...");
  
  var from = iSermonConfig.iSermonEmailAccount;
  var to = iSermonConfig.iSermonEmailAccount;
  var subject = "iSermon: New Download Request";
  var text = "";
  text += "Dear Admin, \n";
  text += "\n";
  text += "Below download request has been received: \n";
  text += "\n";
  text += "Username: " +  "\n";
  text += username + "\n";
  text += "\n";
  text += "Remarks1: " + "\n";
  text += remarks1 + "\n";
  text += "\n";
  text += "Remarks2: " + "\n";
  text += remarks2 + "\n";
  text += "\n";
  text += "Remarks3: " + "\n";
  text += remarks3 + "\n";
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
  logger.info("mailOptions: " + JSON.stringify(mailOptions));

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      logger.info(error);
    } else {
      logger.info("Email sent: " + info.response);
    }
  });
}


