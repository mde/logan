var http = require('http')
  , fs = require('fs')
  , sys = require('sys');
/**
 * The runner for browser-based tests. Starts up an HTTP server
 * for running the tests, and handles all the source-code transformation
 * needed to make CommonJS require work with browser-based code-loading.
 * See below for details.
 */
exports.BrowserRunner = function (runner) {

  // =====================
  // This is a hack to make CommonJS requires work via XHR of source and
  // global-eval/script-append in the browser.
  // This transforms require statements in source code to overwrite variable
  // assignments and change require calls to use special logan.require
  // We don't want the var assignments because that happens as the code is
  // evaled. The code-eval happens via the special logan.require -- see
  // lib/browser/adapter.js for details
  // =====================
  // Matches "someVarName = require('some/path')"
  var _requirePat = /\s+[a-zA-Z_$][0-9a-zA-Z_$\.]*\s*=\s*(require\(.+?\))/g
  // Transformation function that does the replacement in the source code
    , _transformRequires = function (sourceCode) {
    var text = sourceCode
      , match;
    while (match = _requirePat.exec(text)) {
      text = text.replace(match[0], ' loganPlaceholder = logan.' + match[1]);
    }
    return text;
  };

  /**
   * Runs the small server app needed to run the tests in the browser
   */
  this.run = function () {
    var _this = this
    // HTTP server for serving tests
      , server = http.createServer();
    server.addListener('request', function (req, resp) {
      var url = req.url.split('?')[0];
      // Index page 
      if (url == '/') {
        _this.serveIndex(url, req, resp);
      }
      // JS files -- serve 'em up
      else if (/\.js$/.test(url)) {
        _this.serveJS(url, req, resp);
      }
      // Can't find this bitch 
      else {
        _this.serveNotFound(url, req, resp);
      }
    });
    server.listen(3030);
    sys.puts('Logan running on localhost port 3030');

  };

  /**
   * Serves the index page 
   */
  this.serveIndex = function (url, req, resp) {
    var text = fs.readFileSync(__dirname + '/index.html', 'utf8').toString();
    text = text.replace('@@testfiles@@', JSON.stringify(runner.testList));
    resp.writeHead(200, {'Content-Type': 'text/html'});
    resp.end(text);
  };

  /**
   * Private function for seeing if this is a JS file we need from
   * the Logan directory
   */
  var _isLoganLocal = function (url) {
    return (url == 'logan.js' || url == 'browser/adapter.js' ||
        url.indexOf('deps/') == 0);
  };

  /**
   * Serves the JS pages, both local dependencies inside Logan, and
   * the actual JS source-code pages that contain the tests
   */
  this.serveJS = function (url, req, resp) {
    url = url.replace(/^\//, '');
    // Files we need from logan dir
    if (_isLoganLocal(url)) {
      url = runner.dirname + '/' + url;
    }
    try {
      text = fs.readFileSync(url, 'utf8').toString();
      text = _transformRequires(text);
      resp.writeHead(200, {'Content-Type': 'application/javascript'});
      resp.end('var loganPlaceholder = null;\n' + text);
    }
    // Psych, it's not there, or something is fucked up
    catch (e) {
      if (e.message.indexOf('No such file') > -1) {
        this.serveNotFound(url, req, resp);
      }
      else {
        resp.writeHead(500, {'Content-Type': 'text/html'});
        resp.end(sys.inspect(e));
      }
    }
  };

  /**
   * Serves a 404 page if the path isn't something we know about.
   */
  this.serveNotFound = function (url, req, resp) {
    resp.writeHead(404, {'Content-Type': 'text/html'});
    resp.end('"' + url + '" Not found');
  };

};

