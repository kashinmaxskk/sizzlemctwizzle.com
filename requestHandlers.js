var http = require("http");
var url = require("url");
var updater = require("./updater");

var isset = updater.isset;

function updateServer(response, request) {
  var parsedUrl = url.parse(request.url, true);
  var pathname = parsedUrl.pathname;
  var query = parsedUrl.query;

  function badGateway() {
    response.writeHead(502, {"Content-Type": "text/javascript"});
    response.write("// 502 - Bad Gateway");
    response.end();
  }

  if (request.headers['user-agent'].match(/AppleWebKit/i)) {
    response.writeHead(200, {"Content-Type": "text/javascript"});
    response.write("// This updater only supports Firefox");
    response.end();
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
            response.writeHead(200, {"Content-Type": "text/javascript"});
            response.write(updater.updaterSource(query, meta));
            response.end();
          });
        }
       }).on('error', function(e) {
         badGateway();      
    });
  } else {
    response.writeHead(404, {"Content-Type": "text/javascript"});
    response.write("// 404 - Not Found\n" +
      "// Better luck next time");
    response.end();
  }
}

exports.updater = updateServer;

