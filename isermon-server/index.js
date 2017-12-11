var app = require('express')();
var pretty = require('express-prettify');
var winston = require('winston')
var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({ filename: './logs/index.log' })
  ]
});
var http = require('http');
var fs = require('fs');
var urltool = require('url');
var path = require('path');

app.use(pretty({ query: 'pretty' }));

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var port = 4001;
app.listen(port, function () {
  logger.info("index>> server listening on port " + port);
});

app.get('/', function (req, res) {
  logger.info("index>> GET /");
  res.json({"name": "isermon", "vision": "connect people with sermons."});
})

app.post('/upload', function (req, res) {
  logger.info("index>> POST /upload");

  var title = req.body.title;
  var speaker = req.body.speaker;
  var scripture = req.body.scripture;
  var intro = req.body.intro;
  var lang = req.body.lang;
  var url = req.body.url;
  logger.info("index>> title: " + title + ", spearker: " + speaker
                        + ", scripture: " + scripture + ", intro: " + intro
                        + ", lang: " + lang + ", url: " + url);

  var basename = path.basename(urltool.parse(url).pathname);
  var newfilename = Date.now() + "_" + basename;
  logger.info("index>> basename: " + basename + ", newfilename: " + newfilename);

  var file = fs.createWriteStream("upload/" + newfilename);
  var request = http.get(url, function(response) {
    response.pipe(file);
  });
  //...
  res.json({"status": "upload complete"});
})
