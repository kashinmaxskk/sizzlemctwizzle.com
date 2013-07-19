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

  return "// The following code (updated 07/19/13) is released under public domain.\n\n" +
    "var AutoUpdater_" + varName + " = {\n" +
    "    id: " + id + ",\n" +
    "    days: " + days + ",\n" +
    "    name: " + name + ",\n" +
    "    version: " + version + ",\n" +
    "    time: new Date().getTime(),\n" +
    "    call: function(response, secure) {\n" +
    "        GM_xmlhttpRequest({\n" +
    "            method: 'GET',\n" +
    "            url: 'http'+(secure ? 's' : '')+'://userscripts.org/scripts/source/'+this.id+'.meta.js',\n" +
    "            onload: function(xpr) {AutoUpdater_" + varName + "; ?>.compare(xpr, response);},\n" +
    "            onerror: function(xpr) {if (secure) AutoUpdater_" + varName + ".call(response, false);}\n" +
    "        });\n" +
    "    },\n" +
    "    enable: function() {\n" +
    "        GM_registerMenuCommand('Enable '+this.name+' updates', function() {\n" +
    "            GM_setValue('updated_" + varName + "', new Date().getTime()+'');\n" +
    "            AutoUpdater_" + varName + ".call(true, true)\n" +
    "        });\n" +
    "    },\n" +
    "    compareVersion: function(r_version, l_version) {\n" +
    "        var r_parts = r_version.split('.'),\n" +
    "            l_parts = l_version.split('.'),\n" +
    "            r_len = r_parts.length,\n" +
    "            l_len = l_parts.length,\n" +
    "            r = l = 0;\n" +
    "        for(var i = 0, len = (r_len > l_len ? r_len : l_len); i < len && r == l; ++i) {\n" +
    "            r = +(r_parts[i] || '0');\n" +
    "            l = +(l_parts[i] || '0');\n" +
    "        }\n" +
    "        return (r !== l) ? r > l : false;\n" +
    "    },\n" +
    "    compare: function(xpr,response) {\n" +
    "        this.xversion=/\\/\\/\\s*@" + uso + "version\\s+(.+)\\s*\\n/i.exec(xpr.responseText);\n" +
    "        this.xname=/\\/\\/\\s*@name\\s+(.+)\\s*\\n/i.exec(xpr.responseText);\n" +
    "        if ( (this.xversion) && (this.xname[1] == this.name) ) {\n" +
    "            this.xversion = this.xversion[1];\n" +
    "            this.xname = this.xname[1];\n" +
    "        } else {\n" +
    "            if ( (xpr.responseText.match('the page you requested doesn\'t exist')) || (this.xname[1] != this.name) )\n" +
    "            GM_setValue('updated_" + varName + "', 'off');\n" +
    "            return false;\n" +
    "        }\n" +
    "        var updated = this.compareVersion(this.xversion, this.version);\n" +
    "        if ( updated && confirm('A new version of '+this.xname+' is available.\\nDo you wish to " +
    (isset(query["show"]) ? "visit the script\'s homepage" : "install the latest version") + "?') ) {\n" +
    (isset(query["show"]) ?
    "            GM_openInTab('http://userscripts.org/scripts/show/' + this.id);\n" :
    "            try {\n" +
    "                location.href = 'http://userscripts.org/scripts/source/' + this.id + '.user.js';\n" +
    "            } catch(e) {}\n") +
    "        } else if ( this.xversion && updated ) {\n" +
    "            if(confirm('Do you want to turn off auto updating for this script?')) {\n" +
    "                GM_setValue('updated_" + varName + "', 'off');\n" +
    "                this.enable();\n" +
    "                alert('Automatic updates can be re-enabled for this script from the User Script Commands submenu.');\n" +
    "            }\n" +
    "        } else if (response)\n" +
    "            alert('No updates available for '+this.name);\n" +
    "    },\n" +
    "    check: function() {\n" +
    "        if (GM_getValue('updated_" + varName + "', 0) == 'off')\n" +
    "            this.enable();\n" +
    "        else {\n" +
    "            if (+this.time > (+GM_getValue('updated_" + varName + "', 0) + 1000*60*60*24*this.days)) {\n" +
    "                GM_setValue('updated_" + varName + "', this.time+'');\n" +
    "                this.call(false, true);\n" +
    "            }\n" +
    "            GM_registerMenuCommand('Check '+this.name+' for updates', function() {\n" +
    "                GM_setValue('updated_" + varName + "', new Date().getTime()+'');\n" +
    "                AutoUpdater_" + varName + ".call(true, true)\n" +
    "            });\n" +
    "        }\n" +
    "    }\n" +
    "};\n" +
    "if (typeof GM_xmlhttpRequest !== 'undefined'" +
    (!isset(query['noinfo']) ?
    " &&\n" +
    "    (typeof GM_info === 'object' || // has a built-in updater?\n" +
    "     GM_info.scriptWillUpdate === false)" : "") + ")\n" +
    "    try {\n" +
    "        if (unsafeWindow.frameElement === null)\n" +
    "            AutoUpdater_" + varName + ".check();\n" +
    "    } catch(e) {\n" +
    "        AutoUpdater_" + varName + ".check();\n" +
    "    }\n";
}

function parseMeta(metadataBlock) {
  var headers = {};
  var line, name, prefix, header, key, value;
  var lines = metadataBlock.split(/\n/).filter(function(s) { 
    return /\/\/ @/.test(s); });

  lines.forEach(function(line) {
    var matches =  line.match(/\/\/\s@(\S+)\s+(.+)\s*$/);
    headers[matches[1]] = matches[2];
  });

  return headers;
}

exports.parseMeta = parseMeta;
exports.updaterSource = updaterSource;
exports.isset = isset;
