var http = require("http");
var url = require("url");

function start(route, handle) {
  function onRequest(request, response) {
    var pathname = url.parse(request.url).pathname;
    if (!/updater\.php/.test(pathname))
      pathname = pathname.substring(0, pathname.lastIndexOf("/") + 1);
    route(handle, pathname, response, request);
  }

  http.createServer(onRequest).listen(8080);
}

exports.start = start;

