var winston = require('winston')
var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({ filename: './logs/subscribeUtil.log' })
  ]
});

var mongo = require('mongodb');

exports.subscribes = function(req, db, callback) {
	logger.info("subscribeUtil>> subscribes start...");

  var collection = db.collection("subscribes");
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
    logger.info("# of subscriptions: " + result.length);
    callback(result);
  })
}

exports.subscribeUser = function(req, db, callback) {
  logger.info("subscribeUtil>> subscribeUser start...");

  var username = req.body.username;
  logger.info("username: " + username);
  var subscribe_username = req.body.subscribe_username;
  logger.info("subscribe_username: " + subscribe_username);

  var collection = db.collection("subscribes");
  var query = {username: username};
  collection.find(query).toArray(function(err, results){
    if (results.length == 0) {
      logger.info("subscribes list is empty for username: " + username);
      var json = {};
      json["username"] = username;
      var subscribe_usernames = [];
      subscribe_usernames.push(subscribe_username);
      json["subscribe_usernames"] = subscribe_usernames;

      collection.insertOne(json, function(err, results2){
        if (err) throw err;
        logger.info("1 subscription inserted.");
      });
    } else {
      logger.info("subscribe list exists for username: " + username);
      var json = results[0];
      var subscribe_usernames = json["subscribe_usernames"];
      subscribe_usernames.push(subscribe_username);
      logger.info("updated subscribe_usernames: " + subscribe_usernames);

      var update = {$set: {subscribe_usernames: subscribe_usernames}};
      logger.info("update: " + JSON.stringify(update));
      collection.update(query, update, function(err, results2){
        logger.info("update complete.")
      });
    }
    callback("subscribe success.");
  });
}
