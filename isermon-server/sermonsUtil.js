var winston = require('winston')
var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({ filename: './logs/sermonsUtil.log' })
  ]
});

var mongo = require('mongodb');

// find sermons from server, parameters (all optional):
//    bookmarkedBy: return sermons bookmarked by a specific user
//    sortBy: specify a sermon attribute as sorting criteria
//    uploadedBy: return sermons uploaded by a specific user
exports.sermons = function(req, db, callback) {
	logger.info("sermonsUtil>> sermons start...");

  var bookmarkedByUsername = req.query.bookmarkedBy;
  logger.info("bookmarkedByUsername: " +bookmarkedByUsername);
  var sortBy = req.query.sortBy;
  logger.info("sortBy: " + sortBy);
  var uploadedBy = req.query.uploadedBy;
  logger.info("uploadedBy: " + uploadedBy);

  if (bookmarkedByUsername != null) {
    logger.info("query from bookmarks...");
    var collection = db.collection("bookmarks");
    var query = {"username": bookmarkedByUsername};
    collection.find(query).toArray(function(err, results){
      if (results.length == 0){
        logger.info("bookmark not exist for user: " + bookmarkedByUsername);
        callback(result);
      } else {
        var bookmarkJson = results[0];
        var sermon_ids = bookmarkJson["sermon_ids"];
        logger.info("sermon_ids: " + sermon_ids);
        var sermon_oids = [];
        for (var i=0; i<sermon_ids.length; i++){
          var oid = new mongo.ObjectID(sermon_ids[i]);
          sermon_oids.push(oid);
        }

        var coll2 = db.collection("sermons");
        var query2 = {_id: {$in: sermon_oids}};
        logger.info("query2: " + JSON.stringify(query2));
        var order = {_id: -1};
        if (sortBy != null){
          delete order["_id"];
          order[sortBy] = -1;
        }
        logger.info("order: " + JSON.stringify(order));

        coll2.find(query2).sort(order).toArray(function(err, results2){
          logger.info("# of sermons: " + results2.length);
          callback(results2);
        })
      }
    })
  } else {
    logger.info("query from sermons...");
    var collection = db.collection("sermons");
    var query = {};
    if (uploadedBy != null && uploadedBy != ""){
      query = {username: uploadedBy};
    }
    logger.info("query: " + JSON.stringify(query));

    var order = {_id: -1};
    if (sortBy != null){
      delete order["_id"];
      order[sortBy] = -1;
    }
    logger.info("order: " + JSON.stringify(order));

    collection.find(query).sort(order).toArray(function(err, result) {
      logger.info("# of sermons: " + result.length);
      callback(result);
    })
  }
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
