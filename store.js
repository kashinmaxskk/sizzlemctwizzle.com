var fs = require('fs');
var mu = require('mu2');

var storeRoot = '/home/medley/Videos';

exports.render = function (req, res) {
  var dir = req.route.params.path || '';
  dir = dir ? '/' + dir + '/' : '/';
  var path = storeRoot + dir;
  var user = req.session ? req.session.user : false;
  fs.readdir(path, function(err, files) {
    var options = { 'user': user, 'dir': dir, files: [] };
    for (var i = 0, len = files.length; i < len; ++i) {
      var file = files[i];
      if (file == "Watched") continue;
      var isDir = fs.lstatSync(path + file).isDirectory();
      options.files.push({name: file, isDir: isDir, num: i});
    }
    mu.compileAndRender('index.html', options).pipe(res);
  });
};

exports.mv = function (req, res) {
  if (req.body.user) {
    login(req, res);
    return;
  }
  var files = req.body.files;
  var dst = storeRoot + '/Watched/';
  var dir = req.route.params.path || '';
  var src = storeRoot + (dir ? '/' + dir + '/' : '/');
  for (var i = 0, len = files.length; i < len; ++i) {
    fs.renameSync(src + files[i], dst + files[i]);
  }
  exports.render(req, res);
}

function login(req, res) {
  if (req.body.user == "sizzle" && req.body.pass == "Superman")
  {
    req.session.user = "sizzle";
  }
  exports.render(req, res);
}
