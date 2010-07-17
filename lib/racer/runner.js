/**
 * The runner for TheRubyRacer. This is freaky -- we have to shell out
 * to to a Ruby program that will turn right back around and embed V8.
 * See the code-loading insanity in racer/adapter.rb
 */
exports.RacerRunner = function (runner) {
  this.run = function () {
    var scriptPath = __dirname + '/racer/adapter.rb';
    var cmd = 'ruby ' + scriptPath + ' ' + process.cwd() + ' ' +
        JSON.stringify(runner.testList).replace(/"/g, '\\"');
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
};

