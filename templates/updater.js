// The following code (updated 07/24/13) is released under public domain.
// Usage guide: https://userscripts.org/guides/45


(function() {
    var days = "{{days}}",
      name = "{{name}}",
      version = "{{version}}",
      time = new Date().getTime();
    function call(response, secure) {
        GM_xmlhttpRequest({
            method: "GET",
            url: "http{{#secure}}s{{/secure}}://userscripts.org/scripts/source/{{id}}.meta.js",
            onload: function(xpr) {compare(xpr, response);},
            onerror: function(xpr) {if (secure) call(response, false);}
        });
    }
    function enable() {
        GM_registerMenuCommand("Enable {{name}} updates", function() {
            GM_setValue("updated_{{var}}", new Date().getTime()+'');
            call(true, true)
        });
    }
    function compareVersion(r_version, l_version) {
        var r_parts = r_version.split("."),
          l_parts = l_version.split("."),
          r_len = r_parts.length,
          l_len = l_parts.length,
          r = l = 0;
        for(var i = 0, len = (r_len > l_len ? r_len : l_len); i < len && r == l; ++i) {
            r = +(r_parts[i] || "0");
            l = +(l_parts[i] || "0");
        }
        return (r !== l) ? r > l : false;
    }
    function compare(xpr, response) {
        var xversion=/\/\/\s*@{{#uso}}uso:{{/uso}}version\s+(.+)\s*\n/i.exec(xpr.responseText);
        var xname=/\/\/\s*@name\s+(.+)\s*\n/i.exec(xpr.responseText);
        if ( (xversion) && (xname[1] == name) ) {
            xversion = xversion[1];
            xname = xname[1];
        } else {
            if ( (xpr.responseText.match("the page you requested doesn't exist")) || (xname[1] != name) )
              GM_setValue("updated_{{var}}", "off");
            return false;
        }
        var updated = compareVersion(xversion, version);
        if ( updated && confirm("A new version of " + xname + " is available.\nDo you wish to {{#show}}visit the script's homepage{{/show}}{{^show}}install the latest version{{/show}}?") ) {
        {{#show}}GM_openInTab("http://userscripts.org/scripts/show/{{id}}");{{/show}}
            {{^show}}try {
                location.href = "http://userscripts.org/scripts/source/{{id}}.user.js";
            } catch(e) {}{{/show}}
        } else if ( xversion && updated ) {
            if(confirm("Do you want to turn off auto updating for this script?")) {
                GM_setValue("updated_{{var}}", "off");
                enable();
                alert("Automatic updates can be re-enabled for this script from the User Script Commands submenu.");
            }
        } else if (response)
            alert("No updates available for {{name}}");
    }
    function check() {
        if (GM_getValue("updated_{{var}}", 0) == "off")
            enable();
        else {
            if (+time > (+GM_getValue("updated_{{var}}", 0) + 1000*60*60*24*days)) {
                GM_setValue("updated_{{var}}", time+'');
                call(false, true);
            }
            GM_registerMenuCommand('Check {{name}} for updates', function() {
                GM_setValue("updated_{{var}}", new Date().getTime()+'');
                call(true, true);
            });
        }
    }
    if (typeof GM_xmlhttpRequest !== "undefined"{{^noinfo}} &&
        (typeof GM_info === 'object' ? // has a built-in updater?
         GM_info.scriptWillUpdate === false : true){{/noinfo}})
        try {
            if (unsafeWindow.frameElement === null) check();
        } catch(e) {
            check();
        }
})();
