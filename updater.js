function isset(v) { return typeof v === 'string'; }

function updaterSource(query, meta) {
  if (!isset(meta['name'])) return "// Script is missing @name";

  var name = meta['name'].replace(/'/g, "\\'");
  if (isset(query['uso']) || !isset(meta['version']))
    var version = meta['uso:version'], uso = "uso:";
  else
    var version = meta['version'], uso = "";
  var id = query['id'];
  var varName = isset(query['var']) && query['var'] != '' ? query['var'] : id;
  var days = isset(query['days']) && query['days'] > 0.04 ? query['days'] : "2";

  if (isset(query['noinfo']) || isset(query['uso'])) {
    name = "'" + name + "'";
    version = "'" + version + "'";
  } else {
    name = "typeof GM_info === 'object' ? GM_info.script.name : '" + name + "'";
    version = "typeof GM_info === 'object' ? GM_info.script.version : '" + version + "'";
  }

  return "// The following code (updated 07/24/13) is released under public domain.\n" +
    "// Usage guide: https://userscripts.org/guides/45\n\n" +
    "(function() {\n" +
    "    var id = " + id + ",\n" +
    "      days = " + days + ",\n" +
    "      name = " + name + ",\n" +
    "      version = " + version + ",\n" +
    "      time = new Date().getTime();\n" +
    "    function call(response, secure) {\n" +
    "        GM_xmlhttpRequest({\n" +
    "            method: 'GET',\n" +
    "            url: 'http'+(secure ? 's' : '')+'://userscripts.org/scripts/source/'+id+'.meta.js',\n" +
    "            onload: function(xpr) {compare(xpr, response);},\n" +
    "            onerror: function(xpr) {if (secure) call(response, false);}\n" +
    "        });\n" +
    "    }\n" +
    "    function enable() {\n" +
    "        GM_registerMenuCommand('Enable '+name+' updates', function() {\n" +
    "            GM_setValue('updated_" + varName + "', new Date().getTime()+'');\n" +
    "            call(true, true)\n" +
    "        });\n" +
    "    }\n" +
    "    function compareVersion(r_version, l_version) {\n" +
    "        var r_parts = r_version.split('.'),\n" +
    "          l_parts = l_version.split('.'),\n" +
    "          r_len = r_parts.length,\n" +
    "          l_len = l_parts.length,\n" +
    "          r = l = 0;\n" +
    "        for(var i = 0, len = (r_len > l_len ? r_len : l_len); i < len && r == l; ++i) {\n" +
    "            r = +(r_parts[i] || '0');\n" +
    "            l = +(l_parts[i] || '0');\n" +
    "        }\n" +
    "        return (r !== l) ? r > l : false;\n" +
    "    }\n" +
    "    function compare(xpr,response) {\n" +
    "        var xversion=/\\/\\/\\s*@" + uso + "version\\s+(.+)\\s*\\n/i.exec(xpr.responseText);\n" +
    "        var xname=/\\/\\/\\s*@name\\s+(.+)\\s*\\n/i.exec(xpr.responseText);\n" +
    "        if ( (xversion) && (xname[1] == name) ) {\n" +
    "            xversion = xversion[1];\n" +
    "            xname = xname[1];\n" +
    "        } else {\n" +
    "            if ( (xpr.responseText.match('the page you requested doesn\\'t exist')) || (xname[1] != name) )\n" +
    "            GM_setValue('updated_" + varName + "', 'off');\n" +
    "            return false;\n" +
    "        }\n" +
    "        var updated = compareVersion(xversion, version);\n" +
    "        if ( updated && confirm('A new version of '+xname+' is available.\\nDo you wish to " +
    (isset(query["show"]) ? "visit the script\'s homepage" : "install the latest version") + "?') ) {\n" +
    (isset(query["show"]) ?
    "            GM_openInTab('http://userscripts.org/scripts/show/'+id);\n" :
    "            try {\n" +
    "                location.href = 'http://userscripts.org/scripts/source/'+id+'.user.js';\n" +
    "            } catch(e) {}\n") +
    "        } else if ( xversion && updated ) {\n" +
    "            if(confirm('Do you want to turn off auto updating for this script?')) {\n" +
    "                GM_setValue('updated_" + varName + "', 'off');\n" +
    "                enable();\n" +
    "                alert('Automatic updates can be re-enabled for this script from the User Script Commands submenu.');\n" +
    "            }\n" +
    "        } else if (response)\n" +
    "            alert('No updates available for '+name);\n" +
    "    }\n" +
    "    function check() {\n" +
    "        if (GM_getValue('updated_" + varName + "', 0) == 'off')\n" +
    "            enable();\n" +
    "        else {\n" +
    "            if (+time > (+GM_getValue('updated_" + varName + "', 0) + 1000*60*60*24*days)) {\n" +
    "                GM_setValue('updated_" + varName + "', time+'');\n" +
    "                call(false, true);\n" +
    "            }\n" +
    "            GM_registerMenuCommand('Check '+name+' for updates', function() {\n" +
    "                GM_setValue('updated_" + varName + "', new Date().getTime()+'');\n" +
    "                call(true, true);\n" +
    "            });\n" +
    "        }\n" +
    "    }\n" +
    "    if (typeof GM_xmlhttpRequest !== 'undefined'" +
    (!isset(query['noinfo']) ?
    " &&\n" +
    "        (typeof GM_info === 'object' ? // has a built-in updater?\n" +
    "         GM_info.scriptWillUpdate === false : true)" : "") + ")\n" +
    "        try {\n" +
    "            if (unsafeWindow.frameElement === null) check();\n" +
    "        } catch(e) {\n" +
    "            check();\n" +
    "        }\n" +
    "})();\n";
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

exports.parseMeta = parseMeta;
exports.updaterSource = updaterSource;
exports.isset = isset;
