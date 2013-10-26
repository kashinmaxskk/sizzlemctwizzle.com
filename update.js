var http = require('http');
var mu = require('mu2');

mu.root = __dirname + '/templates';

exports.handle = function handle(req, res) {
  var userAgent = req.headers['user-agent'];
  if (userAgent && userAgent.match(/AppleWebKit/i)) {
    sendJS(res, 403, "// This updater only supports Firefox");
    return;
  }

  var id = req.route.params.id;
  var opts = req.query;
  if (id) opts.id = id;
  if (!opts.days || opts.days < 0.04) opts.days = 2;
  if (!opts.var) opts.var = opts.id;
  if (isset(opts.noinfo)) opts.noinfo = true;

  var data = "";
  http.get('http://userscripts.org/scripts/source/' + opts.id + '.meta.js', 
    function(usres) {
      if (usres.statusCode != 200) badGateway(res);
      else {
        usres.on('data', function (chunk) {
          data += chunk;
        });
          
        usres.on('end', function() {
          var meta = parseMeta(new String(data));
          sendSource(res, opts, meta);
        });
      }
    }).on('error', function(e) {
      badGateway(res);    
  });
}

function parseMeta(metadataBlock) {
  var headers = {};
  var lines = metadataBlock.split(/\n/).filter(function(s) { 
    return /^\/\/ @/.test(s); });

  lines.forEach(function(line) {
    var matches =  line.match(/\/\/ @(\S+)(?:\s+(.+))?\s*$/);
    headers[matches[1]] = matches[2];
  });

  return headers;
}

function sendSource(res, opts, meta) {
  if (!isset(meta['name'])) 
    sendJS(res, 200, "// Script is missing @name");

  opts['name'] = meta['name'];

  if (isset(opts.uso) || !isset(meta['version'])) {
    opts.version = meta['uso:version'];
    opts.uso = true;
  } else {
    opts.version = meta['version']; 
    opts.uso = false;
  }
  
  res.set("Content-Type", "text/javascript");
  mu.compileAndRender('updater.js', opts).pipe(res);
}

function sendJS(res, code, text) {
  res.set("Content-Type", "text/javascript");
  res.send(code, text);
}

function badGateway(res) {
  sendJS(res, 502, "// 502 - Bad Gateway");
}

function isset(v) { return typeof v === 'string'; }


