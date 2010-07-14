
if (typeof logan == 'undefined') { logan = {}; }
var loganBase = new function () {
  this.files = [];
  this.dirname = null;
  this.filename = null;
  this.total = 0;
  this.successes = 0;
  
  this.register = function (files) {
    this.files = files;
    var file;
    while (file = this.files.shift()) {
      this.adapter.loadTestFile(file);
    }
    this.reportFinal(this.total, this.successes);
  };

  this.run = function (namespace) {
    for (var p in namespace) {
      if (/^test/.test(p) && typeof namespace[p] == 'function') {
        try {
          this.total++;
          namespace[p]();
          this.reportTest('Success: ' + p, true);
          this.successes++;
        }
        catch (e) {
          //console.log(e);
          var msg = e.message || '';
          msg = msg ? '(' + msg + ')' : '';
          this.reportTest('Failure: ' + p + ' ' + msg); 
        }
      }
    }
  };

  this.require = function (name, path) {
    return this.adapter.require(name, path);
  };

  this.reportTest = function (str, success) {
    return this.adapter.reportTest(str, success);
  };

  this.reportFinal = function (total, successes) {
    return this.adapter.reportFinal(total, successes);
  };

}();

for (var p in loganBase) {
  logan[p] = loganBase[p];
};
