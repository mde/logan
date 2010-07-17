var sys = require('sys');

var NodeAdapter = function (logan) {
  this.logan = logan;
};

NodeAdapter.prototype = new function () {
  this.reportTest = function (str, success) {
    var cl = success ? 'success' : 'failure';
    sys.puts(str);
  };

  this.reportFinal = function (total, successes, failures) {
    var results = 'Tests run: ' + total + ' total, ' +
        successes + ' successes, ' + failures + ' failures';
    sys.puts(results);
  };


}();

exports.NodeAdapter = NodeAdapter;
