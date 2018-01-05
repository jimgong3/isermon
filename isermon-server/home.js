var app = require('express')();
var pretty = require('express-prettify');
var winston = require('winston')
var logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({ filename: './logs/home.log' })
  ]
});

app.use(pretty({ query: 'pretty' }));

var port = 80;

app.listen(port, function () {
  logger.info("home>> server listening on port " + port);
});

app.get('/', function (req, res) {
  logger.info("home>> GET /");

  res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
  res.write('講道 - 收聽全世界的精彩講道！ <br>');
  res.write('<br>');
  res.write('如有任何查詢，歡迎發送電郵至isermonhk@gmail.com。 <br>');
  res.write('<br>');
  res.write('iSermon團隊敬上 <br>');

  return res.end();
})
