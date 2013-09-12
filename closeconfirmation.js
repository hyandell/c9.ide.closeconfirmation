/**
 * This plugin gives a 'close confirmation' when closing the IDE
 *
 * @copyright 2012, Cloud9 IDE, Inc.
 * @license GPLv3 <http://www.gnu.org/licenses/gpl.txt>
 */
"use strict";
define(function(require, exports, module) {
    main.consumes = [
        "plugin", "tabManager", "settings", "preferences"
    ];
    main.provides = ["closeconfirmation"];
    return main;

    function main(options, imports, register) {
        var Plugin      = imports.plugin;
        var tabs        = imports.tabManager;
        var settings    = imports.settings;
        var prefs       = imports.preferences;

        /***** Initialization *****/

        var plugin = new Plugin("Ajax.org", main.consumes);
        var emit   = plugin.getEmitter();

        var loaded = false;
        function load(callback){
            if (loaded) return false;
            loaded = true;

            // when unloading the window
            window.onbeforeunload = onBeforeUnloadHandler;
            
            settings.on("read", function(){
                settings.setDefaults("user/general", [
                    ["confirmexit", "false"]
                ]);
            }, plugin);

            prefs.add({
                "General" : {
                    "General" : {
                        "Warn Before Exiting" : {
                            type     : "checkbox",
                            position : 8000,
                            path     : "user/general/@confirmexit"
                        }
                    }
                }
            }, plugin);
        }

        function unload() {
            if (window.onbeforeunload === onBeforeUnloadHandler)
                window.onbeforeunload = null;
        }

        /***** Methods *****/

        function onBeforeUnloadHandler() {
            var changed = false;
            tabs.getTabs().forEach(function(tab){
                changed = changed || (tab.document.value && tab.document.changed);
            });

            emit("exit", { changed: changed });

            if (changed)
                return "You have unsaved changes. Your changes will be lost if you don't save them";

            // see what's in the settings
            var confirmExit = settings.getBool("user/general/@confirmexit");
            if (confirmExit)
                return "You're about to leave Cloud9 IDE.";
        }

        /***** Lifecycle *****/

        plugin.on("load", function(){
            load();
        });
        plugin.on("enable", function(){

        });
        plugin.on("disable", function(){

        });
        plugin.on("unload", function(){
            unload();
            loaded = false;
        });

        /***** Register and define API *****/

        plugin.freezePublicAPI({
        });

        register(null, {
            closeconfirmation: plugin
        });
    }
});
