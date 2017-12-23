var winston = require('winston')
var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({ filename: './logs/sermonsUtil.log' })
  ]
});

var mongo = require('mongodb');

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

exports.addSermonListenCount = function(req, db, callback){
  logger.info("sermonUtil>> addSermonListenCount start...");

  var sermon_id = req.body.sermon_id;
  logger.info("sermon_id: " + sermon_id);

  var collection = db.collection("sermons");
  var oid = new mongo.ObjectID(sermon_id);
  var query = {"_id": oid};
  logger.info("query: " + JSON.stringify(query));
  collection.find(query).toArray(function(err, results){
    if(results.length == 0){
      logger.info("sermon not found: " + sermon_id);
      callback("sermon not found: " + sermon_id);
    } else {
      var sermonJson = results[0];
      var update = {$set: {num_listen: sermonJson["num_listen"] + 1}};
      logger.info("update: " + JSON.stringify(update));
      collection.update(query, update, function(err, results2){
        logger.info("update success.")
        callback("update success.")
      })
    }
  })
}
