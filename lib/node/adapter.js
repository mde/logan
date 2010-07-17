var sys = require('sys');

var NodeAdapter = function () {};

NodeAdapter.prototype = new function () {
  this.reportTest = function (str, success) {
    var cl = success ? 'success' : 'failure';
    sys.puts(str);
  };

  this.reportFinal = function (total, successes) {
    var results = 'Tests run: ' + total + ' total, ' + successes + ' successes';
    sys.puts(results);
  };


}();

exports.NodeAdapter = NodeAdapter;
