var zlib = require('zlib');

function sendResponse(input, contentType, request, response, code, cacheObj) {
  var acceptEncoding = request.headers['accept-encoding'];
  var headers = {'Content-Type': contentType};
  var encoding = 'none';

  function resCb(err, buffer) {
    if (err) throw err;

    if (encoding != 'none') headers['content-encoding'] = encoding;
    headers['Content-Length'] = buffer.length;
    response.writeHead(code || 200, headers);
    response.end(buffer);

    if (cacheObj && !cacheObj.content[encoding])
      cacheObj.content[encoding] = buffer;
  }

  function readCb(err, data) {
    if (err) throw err;

    if (data.length <= 2048) {
      encoding = 'none';
      resCb(null, data);
    } else if (encoding == 'deflate') zlib.deflate(data, resCb);
    else if (encoding == 'gzip') zlib.gzip(data, resCb);
    else resCb(null, data);
  }

  if (!acceptEncoding) {
    acceptEncoding = '';
  }

  // Note: this is not a conformant accept-encoding parser.
  // See http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.3
  if (acceptEncoding.match(/\bdeflate\b/)) {
    encoding = 'deflate';
  } else if (acceptEncoding.match(/\bgzip\b/)) {
    encoding = 'gzip';
  }

  if (cacheObj && cacheObj.content[encoding]) {
    resCb(null, cacheObj.content[encoding]);
  } else if (cacheObj) {
    cacheObj.loadFile(readCb);
  } else {
    readCb(null, input);
  }
}

exports.sendResponse = sendResponse;
