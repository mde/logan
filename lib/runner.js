var http = require('http'),
    fs = require('fs'),
    sys = require('sys'),
    ch = require('child_process');
    args = process.argv.slice(2),
    env = args[0];

var runner = new function () {
  this.env = env;
  this.testList = [];

  this.getTestListAndRun = function () {
    var paths, jsFiles = [], _this = this;
    ch.exec("find . | grep -v dist | grep '/tests/' | grep '\.js$'", function(err, stdout, stderr){
      paths = stdout.split('\n')
      paths.pop();
      for (var i = 0; i < paths.length; i++) {
        jsFiles.push(paths[i]);
      }
      _this.testList = jsFiles;
      _this.run();
    });
  };

  this.run = function () {
    switch (this.env) {
      case 'browser':
        runner.runTestsBrowser();
        break;
      case 'node':
        runner.runTestsNode();
      case 'racer':
        runner.runTestsRacer();
        break;
      default:
        sys.puts('Unknown environment');
    }

  };

  /**
   * Runs the small server app needed to run the tests in the browser
   */
  this.runTestsBrowser = function () {
    // Create the HTTP server for serving tests
    var server = http.createServer(),
        _this = this;
    server.addListener('request', function (req, resp) {
      var text,
          url = req.url.split('?')[0];
      // Default, serve the index page
      if (url == '/') {
        resp.writeHead(200, {'Content-Type': 'text/html'});
        text = fs.readFileSync(__dirname + '/browser/index.html', 'utf8').toString();
        text = text.replace('@@testfiles@@', JSON.stringify(_this.testList));
        resp.end(text);
      }
      // JS files -- serve 'em up
      else if (/\.js$/.test(url)) {
        resp.writeHead(200, {'Content-Type': 'application/javascript'});
        url = url.replace(/^\//, '');
        if (url == 'logan.js' || url == 'browser/adapter.js') {
          url = __dirname + '/' + url;
        }
        // Files to be served out of the local deps/ directory,
        // e.g., assert.js
        if (url.indexOf('deps/') == 0) {
          url = __dirname + '/browser/' + url;
        }
        try {
          text = fs.readFileSync(url, 'utf8').toString();
          var pat = /\s+[a-zA-Z_$][0-9a-zA-Z_$\.]*\s*=\s*(require\(.+?\))/g;
          var match;
          while (match = pat.exec(text)) {
            text = text.replace(match[0], ' loganPlaceholder = logan.' + match[1]);
          }
          resp.end('var loganPlaceholder = null;\n' + text);
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

  this.runTestsRacer = function () {
    var scriptPath = __dirname + '/racer/adapter.rb';
    var cmd = 'ruby ' + scriptPath + ' ' + process.cwd() + ' ' +
        JSON.stringify(this.testList).replace(/"/g, '\\"');
    ch.exec(cmd, function(err, stdout, stderr){
      if (err) {
        throw err;
      }
      else if (stderr) {
        throw new Error(stderr);
      }
      sys.print(stdout);
    });
  };

}();

runner.getTestListAndRun();
