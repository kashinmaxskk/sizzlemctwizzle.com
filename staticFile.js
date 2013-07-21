var fs = require("fs");
var url = require("url");
var sender = require('./sender');

function getMimetype(ext) {
  var mimetype = {
    ".pdf" : "application/pdf",
    ".sig" : "application/pgp-signature",
    ".spl" : "application/futuresplash",
    ".class" : "application/octet-stream",
    ".ps" : "application/postscript",
    ".torrent" : "application/x-bittorrent",
    ".gz" : "application/x-gzip",
    ".swf" : "application/x-shockwave-flash",
    ".tar.gz" : "application/x-tgz",
    ".tgz" : "application/x-tgz",
    ".tar" : "application/x-tar",
    ".zip" : "application/zip",
    /*".mp3" : "audio/mpeg",
    ".ogg" : "application/ogg",
    ".wav" : "audio/x-wav",*/
    ".gif" : "image/gif",
    ".jar" : "application/x-java-archive",
    ".jpg" : "image/jpeg",
    ".jpeg" : "image/jpeg",
    ".png" : "image/png",
    ".css" : "text/css",
    ".html" : "text/html",
    ".htm" : "text/html",
    ".js" : "text/javascript",
    ".asc" : "text/plain",
    ".c" : "text/plain",
    ".cpp" : "text/plain",
    ".log" : "text/plain",
    ".conf" : "text/plain",
    ".text" : "text/plain",
    ".txt" : "text/plain",
    ".dtd" : "text/xml",
    ".xml" :"text/xml",
    /*".mpeg" : "video/mpeg",
    ".mpg" : "video/mpeg",
    ".mov" : "video/quicktime",
    ".qt" : "video/quicktime",
    ".avi" : "video/x-msvideo",
    ".asf" : "video/x-ms-asf",
    ".asx" : "video/x-ms-asf",
    ".wmv" : "video/x-ms-wmv",*/
    ".bz2" : "application/x-bzip",
    ".tbz" : "application/x-bzip-compressed-tar",
    ".tar.bz2" : "application/x-bzip-compressed-tar"
  };

  return typeof mimetype[ext] == 'string' ? mimetype[ext] : null;
}

var StaticCache = {};

function FileCache(path, mtime)
{
  this.path = path;
  this.content = {};
  this.mtime = mtime.getTime();
}

FileCache.prototype = {
  'path' : null,
  'content' : {}, 
  'mtime' : 0,
  'loadFile' : function(cb) {
    fs.readFile(this.path, cb);
  }
};

function serve(response, request) {
  var pathname = 'static' + url.parse(request.url).pathname.replace(/\.\.\/?/g, '');
  if (pathname == 'static/') pathname += 'index.html';
  var dot = pathname.lastIndexOf(".");
  if (dot > -1) {
    var ext = pathname.substring(dot);
    var contentType = getMimetype(ext);
  } else var contentType = null;

  function notFound() {
    sender.sendResponse("<html>" +
      "<head>" +
      "<title>404 - Not Found</title>" +
      "</head>" +
      "<body>" +
      "<h1>404 - Not Found</h1>" +
      "</body></html>",
      "text/html", request, response, 404);
  }

  if (!contentType) {
    notFound();
    return;
  }

  fs.stat(pathname, function(err, stats) {
    if (stats && stats.isFile()) {
        var cacheObj = StaticCache[pathname];
      if (typeof cacheObj == 'undefined') {
        cacheObj = new FileCache(pathname, stats.mtime);
        StaticCache[pathname] = cacheObj;
      } else if (cacheObj.mtime < stats.mtime.getTime()) {
          cacheObj.mtime = stats.mtime.getTime();
          cacheObj.content = {};
      }

      sender.sendResponse(null, contentType, request, 
        response, 200, cacheObj);
    } else notFound();
  });
}

exports.serve = serve;
