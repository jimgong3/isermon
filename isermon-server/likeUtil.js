var winston = require('winston')
var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({ filename: './logs/likeUtil.log' })
  ]
});

var mongo = require('mongodb');

exports.likes = function(req, db, callback) {
	logger.info("likeUtil>> likes start...");

  var collection = db.collection("likes");
  var condition = [];

  if (req.query.username != null) {
    var username = req.query.username;
    logger.info("add condition: username = " + username);
    condition.push({"username": username});
  }

  var query = {};
  if (condition.length > 0) {
    query = {$and: condition};
  }
  logger.info("query: " + JSON.stringify(query));

  var order = {_id: -1};
  logger.info("order: " + JSON.stringify(order));

  collection.find(query).sort(order).toArray(function(err, result) {
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
        updateSermonLikeCount(sermon_id, 1, db);
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
        updateSermonLikeCount(sermon_id, 1, db);
      });
    }
    callback("like success.");
  });
}

function updateSermonLikeCount(sermon_id, delta, db){
  logger.info("updateSermonLikeCount start...");

  var collection = db.collection("sermons");
  var oid = new mongo.ObjectID(sermon_id);
  var query = {"_id": oid};
  logger.info("query: " + JSON.stringify(query));
  collection.find(query).toArray(function(err, results){
    if(results.length == 0){
      logger.info("sermon not found: " + sermon_id);
    } else {
      var sermonJson = results[0];
      var update = {$set: {num_like: sermonJson["num_like"] + delta}};
      logger.info("update: " + JSON.stringify(update));
      collection.update(query, update, function(err, results2){
        logger.info("update success.")
      })
    }
  })
}


exports.unlikeSermon = function(req, db, callback) {
  logger.info("likeUtil>> unlikeSermon start...");

  var username = req.body.username;
  logger.info("username: " + username);
  var sermon_id = req.body.sermon_id;
  logger.info("sermon_id: " + sermon_id);

  var collection = db.collection("likes");
  var query = {username: username};
  collection.find(query).toArray(function(err, results){
    if (results.length == 0) {
      logger.info("not likely to happen...");
    } else {
      logger.info("like list exists for username: " + username);
      var likelistJson = results[0];
      var sermon_ids = likelistJson["sermon_ids"];
      var index = sermon_ids.indexOf(sermon_id);
      if(index> -1){
        sermon_ids.splice(index, 1);
      }
      logger.info("updated sermon_ids: " + sermon_ids);

      var update = {$set: {sermon_ids: sermon_ids}};
      logger.info("update: " + JSON.stringify(update));
      collection.update(query, update, function(err, results2){
        logger.info("update complete.")
        updateSermonLikeCount(sermon_id, -1, db);
      });
    }
    callback("unlike success.");
  });
}
