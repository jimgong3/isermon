var winston = require('winston')
var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({ filename: './logs/sermonsUtil.log' })
  ]
});

// find sermons from server
exports.sermons = function(req, db, callback) {
	logger.info("sermonsUtil>> sermons start...");

  var collection = db.collection("sermons");
  
  var order = {_id: -1};
  logger.info("sermonssUtil>> order: " + JSON.stringify(order));

  collection.find().sort(order).toArray(function(err, result) {
    logger.info("sermonsUtil>> # of sermons: " + result.length);
    callback(result);
  })
}
