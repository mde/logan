var RacerAdapter = function () {};

RacerAdapter.prototype = new function () {
  this.require = function (name, path) {
    _logString += 'require';
  };

  this.reportTest = function (str, success) {
    _logString += str + '\n';
  };

  this.reportFinal = function (total, successes) {
    var results = 'Tests run: ' + total + ' total, ' + successes + ' successes';
    _logString += '\n'
    _logString += results + '\n';
  };


}();
