var winston = require('winston')
var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({ filename: './logs/sermonsUtil.log' })
  ]
});

var mongo = require('mongodb');
var translator = require('./translator');
var formidable = require('formidable');
var path = require('path');
var fs = require('fs');
var urltool = require('url');

var iSermonConfig = require('./iSermonConfig');

// find sermons from server, parameters (all optional):
//    bookmarkedBy: return sermons bookmarked by a specific user
//    subscribedByUsername: return sermons subscribed by a specific user
//    sortBy: specify a sermon attribute as sorting criteria
//    uploadedBy: return sermons uploaded by a specific user
exports.sermons = function(req, db, callback) {
	logger.info("sermonsUtil>> sermons start...");

  var bookmarkedByUsername = req.query.bookmarkedBy;
  logger.info("bookmarkedByUsername: " + bookmarkedByUsername);
  var subscribedByUsername = req.query.subscribedByUsername;
  logger.info("subscribedByUsername: " + subscribedByUsername);
  var uploadedBy = req.query.uploadedBy;
  logger.info("uploadedBy: " + uploadedBy);

  var sortBy = req.query.sortBy;
  logger.info("sortBy: " + sortBy);
  var order = {_id: -1};
  if (sortBy != null){
    delete order["_id"];
    order[sortBy] = -1;
  }
  logger.info("order: " + JSON.stringify(order));

  if (bookmarkedByUsername != null) {
    logger.info("query from bookmarks...");
    querySermonsByBookmarks(bookmarkedByUsername, db, order, function(result){
      callback(result);
    });
  } else if (subscribedByUsername != null) {
    logger.info("query from subscriptions...");
    querySermonsBySubscription(subscribedByUsername, db, order, function(result){
      callback(result);
    });
  } else {
    logger.info("query from sermons...");
    var collection = db.collection("sermons");
    var query = {};
    if (uploadedBy != null && uploadedBy != ""){
      query = {username: uploadedBy};
    }
    logger.info("query: " + JSON.stringify(query));

    collection.find(query).sort(order).toArray(function(err, result) {
      logger.info("# of sermons: " + result.length);
      callback(result);
    })
  }
}

function querySermonsByBookmarks(bookmarkedByUsername, db, order, callback){
  logger.info("sermonsUtil>> querySermonsByBookmarks start...");

  var collection = db.collection("bookmarks");
  var query = {"username": bookmarkedByUsername};

  collection.find(query).toArray(function(err, results){
    if (results.length == 0){
      logger.info("bookmark not exist for user: " + bookmarkedByUsername);
      callback(results);
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

      coll2.find(query2).sort(order).toArray(function(err, results2){
        logger.info("# of sermons: " + results2.length);
        callback(results2);
      })
    }
  })
}

function querySermonsBySubscription(subscribedByUsername, db, order, callback){
  logger.info("sermonsUtil>> querySermonsBySubscription start...");

  var collection = db.collection("subscribes");
  var query = {"username": subscribedByUsername};

  collection.find(query).toArray(function(err, results){
    if (results.length == 0){
      logger.info("subscription not exist for user: " + subscribedByUsername);
      callback(results);
    } else {
      var json = results[0];
      var subscribe_usernames = json["subscribe_usernames"];
      logger.info("subscribe_usernames: " + subscribe_usernames);

      var coll2 = db.collection("sermons");
      var query2 = {username: {$in: subscribe_usernames}};
      logger.info("query2: " + JSON.stringify(query2));

      coll2.find(query2).sort(order).toArray(function(err, results2){
        logger.info("# of sermons: " + results2.length);
        callback(results2);
      })
    }
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

// search sermons, parameters (all optional):
//    q: search keyword
exports.search = function(req, db, callback){
  logger.info("sermonsUtil>> search start...");
  var collection = db.collection('sermons');
  var condition = [];

  var keyword = req.query.q;
  if (keyword != null){
    keyword = translator.translate2(keyword);
    var regexStr = ".*" + keyword + ".*";
	  condition.push({$or:[
						{"title": {$regex: regexStr}},
						{"description": {$regex: regexStr}}
					]});
  }

  var query = {};
  if (condition.length > 0)
	   query = {$and: condition};
     logger.info("query: " + JSON.stringify(query));

  var order = {_id: -1};
  logger.info("order: " + JSON.stringify(order));

  collection.find(query).sort(order).toArray(function(err, results) {
    logger.info("# of sermons: " + results.length);
    callback(results);
  });
}

exports.getDelete = function (req, res) {
  logger.info("sermonsUtil>> getDelete start...");

  res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
  res.write('<form action="deleteSermon" method="post" enctype="multipart/form-data" accept-charset="utf-8">');

  res.write('<h1>講道錄音下架</h1>');
  res.write('講道ID: <br>');
  res.write('<input type="text" name="sermonId" placeholder="" size=40><br>');
  res.write('<br>');
  res.write('管理員密碼: <br>');
  res.write('<input type="password" name="adminPassword" placeholder="" size=40><br><br>');

  res.write('<input type="submit">');
  res.write('</form>');

  return res.end();
}

exports.deleteSermon = function(req, res, db, callback) {
  logger.info("sermonsUtil>> deleteSermon start...");

  var form = new formidable.IncomingForm();
  form.parse(req, function (err, fields, files) {
	var sermonId = fields.sermonId;
	logger.info("sermonId: " + sermonId);
	var adminPassword = fields.adminPassword;
	logger.info("adminPassword: " + adminPassword);

	if (adminPassword != iSermonConfig.adminPassword){
		logger.info("delete failure - incorrect admin password");
		callback("Delete failure - incorrect admin password");
		return;
	}

	if (!(/[a-f0-9]{24}/.test(req.params.id))) {
		logger.info("delete failure - invalid sermon id");
		callback("Delete failure - invalid sermon id");
		return;
	}

	var oid = new mongo.ObjectID(sermonId);
	var query = {_id: oid};
	logger.info("query: " + JSON.stringify(query));

	var collection = db.collection('sermons');
	collection.find(query).toArray(function(err, results2){
		if(results2.length == 0){
			logger.info("Delete failure, sermonId not found");
			callback("Delete failure, sermonId not found");
		} else {
			var json = results2[0];
			var urlLocal = json["urlLocal"];
			logger.info("urlLocal: " + urlLocal);

			collection.deleteOne(query, function(err, results){
				if(err) throw err;
				logger.info("1 sermon deleted.")
				callback("Delete success.")

				//delete file on disk
				var basename = path.basename(urltool.parse(urlLocal).pathname);
				logger.info("basename: " + basename);
				var localPath = "http/upload/" + basename;
				logger.info("localPath: " + localPath);
				fs.unlink(localPath, function(err){
					if(err) throw err;
					logger.info("local file deleted from disk");
				});
			});
		}
	});

  });
}
