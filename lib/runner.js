var http = require('http')
  , fs = require('fs')
  , sys = require('sys')
  , ch = require('child_process')
  , args = process.argv.slice(2);

var runner = new function () {
  // List of available environments to run tests in
  var _envMap = {browser: true, node: true, racer: true,};

  // browser, node, racer
  this.env = args[0];
  // The list of files containing all our tests
  this.testList = [];
  // Location of the logan/ directory
  this.dirname = __dirname;

  /**
   * Get the list of test files and run the tests 
   */
  this.start = function () {
    var paths
      , _this = this;

    // Find any .js files inside test/ directories under the current dir
    ch.exec("find . | grep -v dist | grep '/tests/' | grep '\.js$'",
        function(err, stdout, stderr) {
      if (stderr) {
        throw new Error(stderr);
      }
      _this.testList = _this.getTestList(stdout); 
      _this.run();
    });
  };

  /**
   * Build the list of tests from stdout find results 
   */
  this.getTestList = function (stdout) {
    var files = []
    , paths = stdout.replace(/\s$/, ''); // Trim trailing newline
    paths = paths.split('\n');
    for (var i = 0; i < paths.length; i++) {
      files.push(paths[i]);
    }
    return files;
  };

  /**
   * Instantiate and run the environment-specific runner
   */
  this.run = function () {
    var env = this.env;
    if (!_envMap[env]) {
      throw new Error('"' + env + '" is not a valid environment.');
    }
    // node => NodeRunner, browser => BrowserRunner, etc.
    var constructorKey = env.substr(0, 1).toUpperCase() + env.substr(1)
      , runnerConstructor = runner[constructorKey + 'Runner']
      , runnerInstance = new runnerConstructor(this);
    runnerInstance.run();
  };

}();

runner.BrowserRunner = require(__dirname + '/browser/runner').BrowserRunner;
runner.RacerRunner = require(__dirname + '/racer/runner').RacerRunner;
runner.NodeRunner = require(__dirname + '/node/runner').NodeRunner;

runner.start();
