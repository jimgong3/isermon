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
  //...
}
