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
  res.write('聽道 - 隨時隨地收聽精彩講道！ <br>');
  res.write('<br>');
  res.write('<a href="http://52.221.212.21:4001/upload">上傳講道錄音</a> <br> ');
  res.write('<br>');
  res.write('如有任何查詢，歡迎發送電郵至isermonhk@gmail.com。 <br>');
  res.write('<br>');
  res.write('聽道App同工敬上 <br>');

  return res.end();
})
