function route(handle, pathname, response, request) {
  if (typeof handle[pathname] === 'function') {
    handle[pathname](response, request);
  } else {
    response.writeHead(404, {"Content-Type": "text/html"});
    response.write('<html>' +
      '<head>' +
      '<title>404 - Not Found</title>' +
      '</head>' +
      '<body>' +
      '<h1>404 - Not Found</h1>' +
      '</body></html>');
    response.end();
  }
}

exports.route = route;

