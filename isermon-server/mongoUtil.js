var MongoClient = require('mongodb' ).MongoClient;
var iSermonConfig = require('./iSermonConfig');
var url = iSermonConfig.mongoUrl;
var _db;

module.exports = {
  connectToServer: function( callback ) {
    MongoClient.connect(url, function( err, db ) {
      _db = db;
      return callback( err );
    });
  },
  getDb: function() {
    return _db;
  }
};
