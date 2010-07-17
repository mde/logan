/**
 * The runner for Node.js -- this is ridiculously easy. Just load up
 * the tests and run them.
 */
exports.NodeRunner = function (runner) {
  this.run = function () {
    var logan = require(runner.dirname + '/logan')
      , NodeAdapter = require(runner.dirname + '/node/adapter').NodeAdapter
      , list = runner.testList;
    // Create the adpater for running the tests
    logan.adapter = new NodeAdapter();
    // Okay, we'll create these globals so we don't have to remove two
    // requires from the test source files in the other environments
    global.logan = logan;
    global.assert = require('assert');
    // Require each of the test files -- this will run the tests
    for (var i = 0, ii = list.length; i < ii; i++) { 
      require(process.cwd() + list[i].replace(/^\./, '').replace(/\.js$/, ''));
    }
    logan.reportFinal(logan.total, logan.successes);
  };
};

