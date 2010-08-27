require 'rubygems'
require 'v8'
require 'json'

dirname = ARGV[0]
test_list = JSON.parse(ARGV[1])
curr_path = File.expand_path(File.dirname(__FILE__))
base_path = curr_path.sub('/racer', '')
adapter_path = curr_path + '/adapter.js'
logan_path = base_path + '/logan.js'
assert_path = base_path + '/deps/assert.js'
json2_path = base_path + '/deps/json2.js'

#test_list = ['./geddy-model/tests/datatypes.js']

def get_requires(code)
  pat = /\s+[a-zA-Z_$][0-9a-zA-Z_$\.]*\s*=\s*require\(.+?\)/;
  return code.scan(pat)
end

def load_file(path)
  File.readlines(path).join
end

def calc_path(dirname, path)
  if path.index('../') == 0
    dir_arr = dirname.split('/')
    path_arr = path.split('/')
    calculated = []
    path_arr.each do |p|
      if p == '..'
        dir_arr.pop
      else
        calculated.push(p)
      end
    end
    calculated = dir_arr + calculated
    return calculated.join('/')
  elsif path.index('./') == 0
    return dirname + path.gsub(/^\./, '')
  else
    return path
  end
end

res = ''
V8::Context.new do |cxt|
  code = <<-eos
    var _logString = '';
    var require = function (path) { return {}; };
    var global = this;
    var window = this;
  eos
  cxt.eval(code)
  cxt.load(logan_path)
  cxt.load(assert_path)
  cxt.load(json2_path)
  cxt.load(adapter_path)

  code = <<-eos
    logan.adapter = new RacerAdapter();
  eos
  cxt.eval(code)

  test_list.each do |t|
    content = load_file(t) 
    requires = get_requires(content)

    requires.each do |r|
      
      path = r.split(/require\(("|')/)[2].sub(/("|')\)/, '')
      content = content.gsub(r, 'loganPlaceHolder = require()')
      
      path = path.sub(/require\(("|')/, '').sub(/("|')\)/, '')
      path = calc_path(t.sub(/\/([^\/]+)\.js$/, ''), path)
      path = dirname + path.sub(/^\./, '') + '.js'
      
      code = load_file(path)
      cxt.eval(code)
    end
   
    cxt.eval(content)
  
  end
  
  code = <<-eos
    logan.reportFinal(logan.total, logan.successes);
    _logString;
  eos
  res = cxt.eval(code)
end

puts res
