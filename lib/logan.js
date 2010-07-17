if (typeof logan == 'undefined') { logan = {}; }

var loganBase = new function () {
  this.dirname = null;
  this.filename = null;
  this.total = 0;
  this.successes = 0;
  
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

  this.reportFinal = function () {
    var failures = this.total - this.successes;
    return this.adapter.reportFinal(this.total, this.successes, failures);
  };

  this.namespace = function (namespaceString, explicitContext) {
    var spaces = namespaceString.split('.')
      , ctxt = explicitContext
      , key;
    if (!ctxt) {
      if (typeof window != 'undefined') {
        ctxt = window;
      }
      if (typeof global != 'undefined') {
        ctxt = global;
      }
    }
    if (!ctxt) {
      throw new Error('No context available for creating a namespace object.');
    }
    for (var i = 0, ii = spaces.length; i < ii; i++) {
      key = spaces[i];
      if (!ctxt[key]) {
        ctxt[key] = {};
      }
      ctxt = ctxt[key];
    }
  };

}();

for (var p in loganBase) {
  logan[p] = loganBase[p];
};

if (typeof module != 'undefined') { module.exports = logan; }
