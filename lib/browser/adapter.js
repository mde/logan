
var BrowserAdapter = function (logan) {
  this.logan = logan;
};

BrowserAdapter.prototype = new function () {
  
  var _appendScriptTag = function (win, code) {
    var script = win.document.createElement('script');
    script.type = 'text/javascript';
    var head = win.document.getElementsByTagName("head")[0] ||
      win.document.documentElement;
    if (document.all) {
      script.text = code;
    }
    else {
      script.appendChild(win.document.createTextNode(code));
    }
    head.appendChild(script);
    head.removeChild(script);
    return true;
  };
  
  this.files = [];
  
  this.register = function (files) {
    this.files = files;
    var file;
    while (file = this.files.shift()) {
      this.loadTestFile(file);
    }
    this.logan.reportFinal();
  };

  this.loadTestFile = function (file) {
    this.dirname = file.replace(/\/([^\/]+)\.js$/, '');
    var content = this.getFile(file);
    this.globalEval(file, content);
  };
  
  this.getFile = function (path) {
    var file = fleegix.xhr.send({
      url: path
      , async: false
      , preventCache: true
      , format: 'object'
      , error: function (resp) {
        throw new Error('Error loading ' + path);
      }
    });
    return file.responseText;
  };

  this.globalEval = function (path, code) {
    var win = window;
    // Do we have a working eval?
    if (typeof _brokenEval == 'undefined') {
      window.eval.call(window, 'var __EVAL_TEST__ = true;');
      if (typeof window.__EVAL_TEST__ != 'boolean') {
        _brokenEval = true;
      }
      else {
        _brokenEval = false;
        delete window.__EVAL_TEST__;
      }
    }
    // Try to eval the code
    try {
      if (_brokenEval) {
        _appendScriptTag(win, code);
      }
      else {
        win.eval.call(win, code);
      }
    }
    // Pass along syntax errors
    catch (e) {
      var err = new Error("Error in eval of code in file '" +
        path + "' (" + e.message + ")");
      err.name = e.name;
      err.stack = e.stack;
      throw err;
    }
  };

  this.require = function () {
    if (typeof arguments[1] != 'undefined') {
      name = arguments[0];
      path = arguments[1];
    }
    else {
      path = arguments[0];
    }
    var calcPath = this.calcPath(path);
    var file = calcPath + '.js';
    var content = this.getFile(file);
    this.globalEval(file, content);
    return {};
  };

  this.calcPath = function (path) {
    if (path.indexOf('../') == 0) {
      var dirArr = this.dirname.split('/');
      var pathArr = path.split('/');
      var pathItem;
      var calculated = [];
      for (var i = 0, ii = pathArr.length; i < ii; i++) {
        pathItem = pathArr[i];
        if (pathItem == '..') {
          dirArr.pop();
        }
        else {
          calculated.push(pathItem);
        }
      }
      calculated = dirArr.concat(calculated);
      return calculated.join('/');
    }
    else if (path.indexOf('./') == 0) {
      return this.dirname + path.replace(/^\./, '');
    }
    else {
      return path;
    }
  };

  this.reportTest = function (str, success) {
    var cl = success ? 'success' : 'failure';
    $('results').innerHTML += '<div class="' + cl + '">' + str + '</div>';
  };

  this.reportFinal = function (total, successes, failures) {
    var results = 'Tests run: ' + total + ' total, ' +
        successes + ' successes, ' + failures + ' failures';
    $('header').innerHTML += results;
  };

}();
