var fs = require('fs');
var mu = require('mu2');
var settings = require('./settings.json');

exports.render = function (req, res) {
  var dir = req.route.params.path || '';
  dir = dir ? '/' + dir + '/' : '/';
  var path = settings.videos + dir;
  if (fs.existsSync(path) && fs.lstatSync(path).isDirectory()) {
    fs.readdir(path, function(err, files) {
      var options = { 'user': req.session.user, 'dir': dir, files: [] };
      for (var i = 0, len = files.length; i < len; ++i) {
        var file = files[i];
        if (file == "Watched") continue;
        var isDir = fs.lstatSync(path + file).isDirectory();
        options.files.push({name: file, isDir: isDir, num: i});
      }
      mu.compileAndRender('index.html', options).pipe(res);
    });
  } else res.send();
};

exports.mv = function (req, res) {
  if (req.body.user) {
    login(req, res);
    return;
  }
  var files = req.body.files;
  var dst = settings.videos + '/Watched/';
  var dir = req.route.params.path || '';
  var src = settings.videos + (dir ? '/' + dir + '/' : '/');
  for (var i = 0, len = files.length; i < len; ++i) {
    fs.renameSync(src + files[i], dst + files[i]);
  }
  redirect(req, res);
}

function login(req, res) {
  if (req.body.user == settings.user && req.body.pass == settings.pass)
  {
    req.session.user = settings.user;
  }
  redirect(req, res);
}

function redirect(req, res) {
  var dir = req.route.params.path || '';
  dir = dir ? '/' + dir + '/' : '/';
  res.redirect(dir);
}