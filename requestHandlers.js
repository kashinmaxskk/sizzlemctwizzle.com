var http = require("http");
var url = require("url");
var updater = require("./updater");
var sender = require('./sender');

var isset = updater.isset;

function updateHandle(response, request) {
  var parsedUrl = url.parse(request.url, true);
  var pathname = parsedUrl.pathname;
  var query = parsedUrl.query;

  function badGateway() {
    sender.sendResponse("// 502 - Bad Gateway", "text/javascript",
      request, response, 502);
  }

  if (request.headers['user-agent'].match(/AppleWebKit/i)) {
    sender.sendResponse("// This updater only supports Firefox", 
      "text/javascript", request, response);
    return;
  }

  if (!isset(query['id'])) {
    matches = pathname.match(/\/(\d+)\.js.*$/);
    if (matches && matches.length > 1) query['id'] = matches[1];
  }

  if (isset(query['id'])) {
    var data = "";
    http.get('http://userscripts.org/scripts/source/' + query['id'] + '.meta.js', 
      function(res) {
        if (res.statusCode != 200) badGateway();
        else {
          res.on('data', function (chunk) {
            data += chunk;
          });
          
          res.on('end', function() {
            var meta = updater.parseMeta(new String(data));
            var source = updater.updaterSource(query, meta);
            sender.sendResponse(source, 'text/javascript', request, response);
          });
        }
       }).on('error', function(e) {
         sender.sendResponse("// 502 - Bad Gateway", "text/javascript",
           request, response, 502);    
    });
  } else badGateway();
}

exports.updater = updateHandle;

