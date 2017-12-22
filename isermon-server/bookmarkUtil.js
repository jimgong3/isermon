var winston = require('winston')
var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({ filename: './logs/bookmarkUtil.log' })
  ]
});

exports.bookmarks = function(req, db, callback) {
	logger.info("bookmarksUtil>> bookmarks start...");

  var collection = db.collection("bookmarks");

  var order = {_id: -1};
  logger.info("order: " + JSON.stringify(order));

  collection.find().sort(order).toArray(function(err, result) {
    logger.info("# of bookmarks: " + result.length);
    callback(result);
  })
}

exports.bookmarkSermon = function(req, db, callback) {
  logger.info("bookmarksUtil>> bookmarks start...");

  var username = req.body.username;
  logger.info("username: " + username);
  var sermon_id = req.body.sermon_id;
  logger.info("sermon_id: " + sermon_id);

  var collection = db.collection("bookmarks");
  var query = {username: username};
  collection.find(query).toArray(function(err, results){
    if (results.length == 0) {
      logger.info("bookmark is empty for username: " + username);
      var bookmarkJson = {};
      bookmarkJson["username"] = username;
      var sermon_ids = [];
      sermon_ids.push(sermon_id);
      bookmarkJson["sermon_ids"] = sermon_ids;

      collection.insertOne(bookmarkJson, function(err, results2){
        if (err) throw err;
        logger.info("1 bookmark inserted.");
      });
    } else {
      logger.info("bookmark exists for username: " + username);
      var bookmarkJson = results[0];
      var sermon_ids = bookmarkJson["sermon_ids"];
      sermon_ids.push(sermon_id);
      logger.info("updated sermon_ids: " + sermon_ids);

      var update = {$set: {sermon_ids: sermon_ids}};
      logger.info("update: " + JSON.stringify(update));
      collection.update(query, update, function(err, results2){
        logger.info("update complete.")
      });
    }
    callback("bookmark success.");
  });
}
