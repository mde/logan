var http = require('http'),
    fs = require('fs'),
    sys = require('sys'),
    args = process.argv.slice(2),
    env = args[0];

var logan = new function () {

  this.runTestsBrowser = function () {
    // Create the HTTP server for serving tests
    var server = http.createServer();
    server.addListener('request', function (req, resp) {
      var text,
          url = req.url.split('?')[0];
      // Default, serve the index page
      if (url == '/') {
        resp.writeHead(200, {'Content-Type': 'text/html'});
        text = fs.readFileSync(__dirname + '/browser/index.html', 'utf8').toString();
        text = text.replace('@@testfiles@@', "['geddy-model/tests/datatypes.js']");
        resp.end(text);
      }
      // JS files -- serve 'em up
      else if (/\.js$/.test(url)) {
        resp.writeHead(200, {'Content-Type': 'application/javascript'});
        url = url.replace(/^\//, '');
        try {
          text = fs.readFileSync(url, 'utf8').toString();
          resp.end(text);
        }
        // File doesn't exist
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
      // WTF, I don't know what this is
      else {
        resp.writeHead(404, {'Content-Type': 'text/html'});
        resp.end('"' + url + '" Not found');
      }
    });
    server.listen(3030, '127.0.0.1');
    sys.puts('Logan running on localhost port 3030');

  };

}();

switch (env) {
  case 'browser':
    logan.runTestsBrowser();
    break;
  default:
    sys.puts('Unknown environment');
}
