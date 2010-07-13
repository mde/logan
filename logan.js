var http = require('http'),
    fs = require('fs'),
    sys = require('sys');

var server = http.createServer();
server.addListener('request', function (req, resp) {
  var text,
      url = req.url.split('?')[0];
  if (url == '/') {
    resp.writeHead(200, {'Content-Type': 'text/html'});
    text = fs.readFileSync('index.html', 'utf8').toString();
    text = text.replace('@@testfiles@@', "['geddy-model/tests/datatypes.js']");
    resp.end(text);
  }
  else if (/\.js$/.test(url)) {
    resp.writeHead(200, {'Content-Type': 'application/javascript'});
    url = url.replace(/^\//, '');
    try {
      text = fs.readFileSync(url, 'utf8').toString();
      resp.end(text);
    }
    catch (e) {
      if (e.message.indexOf('No such file') > -1) {
        resp.writeHead(404, {'Content-Type': 'text/html'});
        resp.end('"' + url + '" Not found');
      }
      else {
        resp.writeHead(500, {'Content-Type': 'text/html'});
        resp.end(sys.inspect(e));
      }
    }
  }
  else {
    resp.writeHead(404, {'Content-Type': 'text/html'});
    resp.end('"' + url + '" Not found');
  }
});
server.listen(6666, '127.0.0.1');

