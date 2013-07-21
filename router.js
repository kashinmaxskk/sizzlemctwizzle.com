var staticFile = require("./staticFile");

function route(handle, pathname, response, request) {
  if (typeof handle[pathname] === 'function') {
    handle[pathname](response, request);
  } else {
    staticFile.serve(response, request);
  }
}

exports.route = route;

