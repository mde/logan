## Logan: a minimal test runner for both server- and client-side JavaScript
- - -

### Installing

Prerequisites: Logan requires Node.js. (<http://nodejs.org/>)

Get Logan:

    git clone git://github.com/mde/logan.git

Build Logan:

    cd logan && make && sudo make install

### Basic usage

    logan [browser|node|racer] 

### Description

    Logan is a minimal test runner for both client- and
    server-side JavaScript. It uses the Node.js assert library.

    Logan supports the following envrironments: 
        * Browsers (via HTTP global-eval/script-append) 
        * Node.js
        * TheRubyRacer

### Test syntax

A Logan test file looks like this:

    var testNamespace = new function () {
      this.testFoo = function () {
        assert.ok(true);
      };

      this.testBar = function () {
        assert.equal(1, 1);
      };

    }();

    logan.run(testNamespace);

Pretty simple.

### Sharing client- and server-side JavaScript code and tests

For Logan's testing purposes, "server-side" means in Node.js,
which uses CommonJS modules. "Client-side" includes the
browsers, and TheRubyRacer, where there is no facility for
loading code modules from within the runtime.

There are a few simple rules to follow when creating a module
to use both in client and server:

1. Name your namespace object in side the module file the same
name as the variable you'll be setting it to when you load it
via CommonJS require.

2. Only export your namespace in the CommonJS environment.

For example, in the module file, foo.js:

    
    if (typeof foo != 'undefined') { foo = {}; }
    
    foo.bar = new function () {
      this.a = 1;
      this.b = function () {};
    }();

    if (typeof module != 'undefined') { module.exports = foo.bar; }


Or, if you are exporting a constructor:

    if (typeof foo != 'undefined') { foo = {}; }
    
    foo.Baz = function () {
      this.a = 2;
      this.b = [];
    };

    if (typeof exports != 'undefined') { exports.Baz = foo.Baz; }

3. When you call require in your source code, use the same
name as in the module. 

4. Create any top-level namespace objects non-destructively.

In your tests, if you're creating top-level namespaces to hang
your required objects on, use something to create them that
checks for their existence before creating.

Logan includes a utility function, `logan.namespace`, to help
with this. In your own app's code, you'll either have to use
a utility function for doing this, or simply check with a
`typeof` check for `undefined`.

Here's how to load and use the previous two examples:

    logan.namespace('foo');
    foo.bar = require('./path/to/foo');
    foo.Bar = require('./path/to/bar').Bar;

    var fooTests = new function () {
      this.testFooBarAIsTruthy = function () {
        assert.ok(foo.bar.a);
      };

      this.testFooBazAIsNumber = function () {
        var barInstance = new foo.Bar();
        assert.equal(typeof barInstance.a, 'number');
      };

    }();

    logan.run(fooTests);

The reason for these special requirements is the difference
between the way that code loads on the client and the way it
loads via CommonJS.

In the client environment (including TheRubyRacer), there
is no module-level scope, and the mechanism for loading code
doesn't return any value, so namespace creation has to happen
inside the module file, and has to be careful not to rewrite
anything other modules might have done.

Logan makes this work with CommonJS `require` syntax in your
tests by doing source-code transformation -- it uses the
require statements to know what code to load, and rewrites
the statements so they don't stomp on the results of the
eval operation.

### Author

Matthew Eernisse, mde@fleegix.org


