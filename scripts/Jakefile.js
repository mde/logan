/*
 * Logan client-/server-side JavaScript test runner  
 * Copyright 2112 Matthew Eernisse (mde@fleegix.org)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
*/

var sys = require('sys');
var child_process = require('child_process');
var fs = require('fs');

desc('Installs the Logan client-/server-side JavaScript test runner.');
task('default', [], function () {
  var uid = process.env.SUDO_UID;
  var gid = process.env.SUDO_GID;
  var cmds = [
    'mkdir -p ~/.node_libraries/logan'
    , 'cp -R ./dist/* ~/.node_libraries/logan'
    , 'chown -R ' + uid + ':' + gid + ' ~/.node_libraries'
    , 'cp scripts/logan /usr/local/bin/'
  ];
  runCmds(cmds, function () {
    sys.puts('Logan installed.');
  });
});

var runCmds = function (arr, callback, printStdout) {
  var run = function (cmd) {
    child_process.exec(cmd, function (err, stdout, stderr) {
      if (err) {
        sys.puts('Error: ' + JSON.stringify(err));
      }
      else if (stderr) {
        sys.puts('Error: ' + stderr);
      }
      else {
        if (printStdout) {
          sys.puts(stdout);
        }
        if (arr.length) {
          var next = arr.shift();
          run(next);
        }
        else {
          if (callback) {
            callback();
          }
        }
      }
    });
  };
  run(arr.shift());
};


