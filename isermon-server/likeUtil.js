var winston = require('winston')
var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({ filename: './logs/likeUtil.log' })
  ]
});

exports.likes = function(req, db, callback) {
	logger.info("likeUtil>> likes start...");

  var collection = db.collection("likes");

  var order = {_id: -1};
  logger.info("order: " + JSON.stringify(order));

  collection.find().sort(order).toArray(function(err, result) {
    logger.info("# of like lists: " + result.length);
    callback(result);
  })
}

exports.likeSermon = function(req, db, callback) {
  logger.info("likeUtil>> likeSermon start...");

  var username = req.body.username;
  logger.info("username: " + username);
  var sermon_id = req.body.sermon_id;
  logger.info("sermon_id: " + sermon_id);

  var collection = db.collection("likes");
  var query = {username: username};
  collection.find(query).toArray(function(err, results){
    if (results.length == 0) {
      logger.info("like list is empty for username: " + username);
      var likelistJson = {};
      likelistJson["username"] = username;
      var sermon_ids = [];
      sermon_ids.push(sermon_id);
      likelistJson["sermon_ids"] = sermon_ids;

      collection.insertOne(likelistJson, function(err, results2){
        if (err) throw err;
        logger.info("1 like inserted.");
      });
    } else {
      logger.info("like list exists for username: " + username);
      var likelistJson = results[0];
      var sermon_ids = likelistJson["sermon_ids"];
      sermon_ids.push(sermon_id);
      logger.info("updated sermon_ids: " + sermon_ids);

      var update = {$set: {sermon_ids: sermon_ids}};
      logger.info("update: " + JSON.stringify(update));
      collection.update(query, update, function(err, results2){
        logger.info("update complete.")
      });
    }
    callback("like success.");
  });
}
