/**
 * Logger module
 * @module src/modules/Logger
 * @type {Object}
 */
(function(stargateModules){

    /**
     * @constructor
     * @alias module:src/modules/Logger
     * @param {String} label - OFF|DEBUG|INFO|WARN|ERROR|ALL
     * @param {String} tag - a tag to identify a log group. it will be prepended to any log function
     * @example
     * var myLogger = new Logger("ALL", "TAG");
     * myLogger.i("Somenthing", 1); // output will be > ["TAG"], "Somenthing", 1
     * myLogger.setLevel("off") // other values OFF|DEBUG|INFO|WARN|ERROR|ALL
     * */
    function Logger(label, tag){
        this.level = Logger.levels[label.toUpperCase()];
        this.tag = tag;
    }

    //Logger.prototype.group
    //OFF < DEBUG < INFO < WARN < ERROR < ALL
    // 0  < 1  < 2 < 3 < 4 < 5
    Logger.levels = {
        ALL:5,
        ERROR:4,
        WARN:3,
        INFO:2,
        DEBUG:1,
        OFF:0
    };

    /**
     * Error Logging
     * @param {*} [arguments]
     * */
    Logger.prototype.e = function(){
        var _arguments = Array.prototype.slice.call(arguments);
        _arguments.unshift(this.tag);

        if(this.level !== 0 && this.level >= Logger.levels.ERROR){
            window.console.error.apply(console, _arguments);
        }
    };

    /**
     * Info Logging
     * @param {*} [arguments]
     * */
    Logger.prototype.i = function(){
        var _arguments = Array.prototype.slice.call(arguments);
        _arguments.unshift(this.tag);

        if(this.level !== 0 && this.level >= Logger.levels.WARN){
            window.console.info.apply(console, _arguments);
        }
    };

    /**
     * Warn Logging
     * @param {*} [arguments]
     * */
    Logger.prototype.w = function(){
        var _arguments = Array.prototype.slice.call(arguments);
        _arguments.unshift(this.tag);

        if(this.level !== 0 && this.level >= Logger.levels.INFO){
            window.console.warn.apply(console, _arguments);
        }
    };

    /**
     * Debug Logging
     * @param {*} [arguments]
     * */
    Logger.prototype.d = function(){
        var _arguments = Array.prototype.slice.call(arguments);
        _arguments.unshift(this.tag);

        if(this.level !== 0 && this.level >= Logger.levels.DEBUG){
            window.console.log.apply(console, _arguments);
        }
    };

    /**
     * Set the level of the logger
     * @param {String} label - OFF|DEBUG|INFO|WARN|ERROR|ALL
     * */
    Logger.prototype.setLevel = function(label){
        this.level = Logger.levels[label];
    };


    /**
     * A module representing a Logger class
     * @exports Logger
     */
    if (stargateModules) {
        stargateModules.Logger = Logger;
    } else {
        window.Logger = Logger;
    }
})(stargateModules);
/**
 * File module
 * @module src/modules/File
 * @type {Object}
 * @see cordova.file
 * @requires ./Logger.js
 */
(function(_modules, Logger){

    var File = {};
    var LOG;
    File.LOG = LOG = new Logger("ALL", "[File - module]");
    /**
     * ERROR_MAP
     * File.ERROR_MAP
     * */
    File.ERROR_MAP = {
        1:"NOT_FOUND_ERR",
        2:"SECURITY_ERR",
        3:"ABORT_ERR",
        4:"NOT_READABLE_ERR",
        5:"ENCODING_ERR",
        6:"NO_MODIFICATION_ALLOWED_ERR",
        7:"INVALID_STATE_ERR",
        8:"SYNTAX_ERR",
        9:"INVALID_MODIFICATION_ERR",
        10:"QUOTA_EXCEEDED_ERR",
        11:"TYPE_MISMATCH_ERR",
        12:"PATH_EXISTS_ERR"
    };

    File.currentFileTransfer = null;
    /**
     * stargateProtected.file.resolveFS
     *
     * @param {String} url - the path to load see cordova.file.*
     * @returns {Promise<Entry|FileError>}
     * */
    File.resolveFS = function(url){
        return new Promise(function(resolve, reject){
            window.resolveLocalFileSystemURL(url, resolve, reject);
        });
    };

    /**
     * File.appendToFile
     *
     * @param {String} filePath - the filepath file:// url like
     * @param {String} data - the string to write into the file
     * @param {string} [overwrite=false] - overwrite
     * @returns {Promise<String|FileError>} where string is a filepath
     */
    File.appendToFile = function(filePath, data, overwrite){
        //Default
        overwrite = arguments[2] === undefined ? false : arguments[2];
        return File.resolveFS(filePath)
            .then(function(fileEntry){

                return new Promise(function(resolve, reject){
                    fileEntry.createWriter(function(fileWriter) {
                        if(!overwrite){
                            fileWriter.seek(fileWriter.length);
                        }
                        var blob = new Blob([data], {type:'text/plain'});
                        fileWriter.write(blob);
                        fileWriter.onerror = reject;
                        fileWriter.onabort = reject;
                        fileWriter.onwriteend = function(){
                            resolve(__transform([fileEntry]));
                        };
                    }, reject);
                });

            });
    };

    /**
     * File.readFileAsHTML
     * @param {String} indexPath - the path to the file to read
     * @returns {Promise<DOM|FileError>}
     */
    File.readFileAsHTML = function(indexPath){

        return File.readFile(indexPath)
            .then(function(documentAsString){
                return new window.DOMParser().parseFromString(documentAsString, "text/html");
            });
    };

    /**
     * File.readFileAsJSON
     * @param {String} indexPath - the path to the file to read
     * @returns {Promise<Object|FileError>}
     */
    File.readFileAsJSON = function(indexPath){
        return File.readFile(indexPath)
            .then(function(documentAsString){
                try{
                    return Promise.resolve(window.JSON.parse(documentAsString));
                }catch(e){
                    return Promise.reject(e);
                }
            });
    };

    /**
     *  File.removeFile
     *
     *  @param {String} filePath - file://
     *  @returns {Promise<String|FileError>}
     * */
    File.removeFile = function(filePath){
        return File.resolveFS(filePath)
            .then(function(fileEntry){
                return new Promise(function(resolve,reject){
                    fileEntry.remove(function(result){
                        resolve(result === null || result === "OK");
                    }, reject);
                });
            });
    };

    /**
     *  File.removeDir
     *
     *  @param {String} dirpath - the directory entry to remove recursively
     *  @returns Promise<void|FileError>
     * */
    File.removeDir = function(dirpath){
        return File.resolveFS(dirpath)
            .then(function(dirEntry){
                return new Promise(function(resolve, reject){
                    dirEntry.removeRecursively(function(result){
                        resolve(result === null || result === "OK");
                    }, reject);
                });
            });
    };

    /**
     *  File._promiseZip
     *
     *  @private
     *  @param {String} zipPath - the file to unpack
     *  @param {String} outFolder - the folder where to unpack
     *  @param {Function} _onProgress - the callback called with the percentage of unzip progress
     *  @returns Promise<boolean>
     * */
    File._promiseZip = function(zipPath, outFolder, _onProgress){

        LOG.d("PROMISEZIP:", arguments);
        return new Promise(function(resolve,reject){
            window.zip.unzip(zipPath, outFolder, function(result){
                if(result === 0){
                    resolve(true);
                }else{
                    reject(result);
                }
            }, _onProgress);
        });
    };

    /**
     * File.download
     *
     * @param {String} url - the URL of the resource to download
     * @param {String} filepath - a directory entry type object where to save the file
     * @param {String} saveAsName - the name with the resource will be saved
     * @param {Function} _onProgress - a progress callback function filled with the percentage from 0 to 100
     * @returns {Promise}
     * */
    File.download = function(url, filepath, saveAsName, _onProgress){
        // one download at time for now
        var ft = new window.FileTransfer();
        ft.onprogress = _onProgress;
        File.currentFileTransfer = ft;

        return new Promise(function(resolve, reject){
            ft.download(window.encodeURI(url), filepath + saveAsName,
                function(entry){
                    resolve(__transform([entry]));
                    File.currentFileTransfer = null;
                },
                function(reason){
                    reject(reason);
                    File.currentFileTransfer = null;
                },
                true //trustAllHosts
            );
        });
    };

    /**
     * File.createDir
     *
     * @param {String} dirPath - a file:// like path
     * @param {String} subFolderName
     * @returns {Promise<String|FileError>} - return the filepath created
     * */
    File.createDir = function(dirPath, subFolderName){
        return File.resolveFS(dirPath)
            .then(function(dirEntry){
                return new Promise(function(resolve, reject){
                    dirEntry.getDirectory(subFolderName, {create:true}, function(entry){
                        resolve(__transform([entry]));
                    }, reject);
                });
            });
    };

    /**
     *  File.fileExists
     *
     *  @param {String} url - the toURL path to check
     *  @returns {Promise<boolean|void>}
     * */
    File.fileExists = function(url){
        return new Promise(function(resolve){
            window.resolveLocalFileSystemURL(url, function(entry){

                resolve(entry.isFile);

            }, function(fileError){
                resolve(fileError.code !== 1);
            });
        });
    };

    /**
     *  File.dirExists
     *
     *  @param {String} url - the toURL path to check
     *  @returns {Promise<boolean|void>}
     * */
    File.dirExists = function(url){
        return new Promise(function(resolve){
            window.resolveLocalFileSystemURL(url, function(entry){

                resolve(entry.isDirectory);

            }, function(fileError){

                resolve(fileError.code != 1);
            });
        });
    };

    /**
     * File.requestFileSystem
     *
     * @param {int} TYPE - 0 == window.LocalFileSystem.TEMPORARY or 1 == window.LocalFileSystem.PERSISTENT
     * @param {int} size - The size in bytes for example 5*1024*1024 == 5MB
     * @returns {Promise}
     * */
    File.requestFileSystem = function(TYPE, size) {
        return new Promise(function (resolve, reject) {
            window.requestFileSystem(TYPE, size, resolve, reject);
        });
    };

    /**
     * File.readDir
     *
     * @param {String} dirPath - a directory path to read
     * @returns {Promise<Array>} - returns an array of Object files
     * */
    File.readDir = function(dirPath){
        return File.resolveFS(dirPath)
            .then(function(dirEntry){
                return new Promise(function(resolve, reject){
                    var reader = dirEntry.createReader();
                    reader.readEntries(function(entries){
                        resolve(__transform(entries));
                    }, reject);
                });
            });
    };

    /**
     * File.readFile
     * @param {String} filePath - the file entry to readAsText
     * @returns {Promise<String|FileError>}
     */
    File.readFile = function(filePath) {

        return File.resolveFS(filePath)
            .then(function(fileEntry){
                return new Promise(function(resolve, reject){
                    fileEntry.file(function(file) {
                        var reader = new FileReader();
                        reader.onerror = reject;
                        reader.onabort = reject;

                        reader.onloadend = function() {
                            var textToParse = this.result;
                            resolve(textToParse);
                        };
                        reader.readAsText(file);
                        //readAsDataURL
                        //readAsBinaryString
                        //readAsArrayBuffer
                    });
                });
            });
    };

    /**
     * File.createFile
     *
     * @param {String} directory - filepath file:// like string
     * @param {String} filename - the filename including the .txt
     * @returns {Promise.<FileEntry|FileError>}
     * */
    File.createFile = function(directory, filename){
        return File.resolveFS(directory)
            .then(function(dirEntry){
                return new Promise(function(resolve, reject){
                    dirEntry.getFile(filename, {create:true}, function(entry){
                        resolve(__transform([entry]));
                    }, reject);
                });
            });
    };

    /**
     * */
    File.write = function(filepath, content){
        return File.appendToFile(filepath, content, true);
    };

    /**
     * */
    File.moveDir = function(source, destination){
        var newFolderName = destination.substring(destination.lastIndexOf('/')+1);
        var parent = destination.replace(newFolderName, "");
        
        LOG.d("moveDir:", parent, newFolderName);
        return Promise.all([File.resolveFS(source), File.resolveFS(parent)])
            .then(function(entries){
                LOG.d("moveDir: resolved entries", entries);
                return new Promise(function(resolve, reject){
                    entries[0].moveTo(entries[1], newFolderName, resolve, reject);
                });
            });
    };

    /**
     * */
    File.copyFile = function(source, destination){
        var newFilename = destination.substring(destination.lastIndexOf('/')+1);
        var parent = destination.replace(newFilename, "");

        return Promise.all([File.resolveFS(source), File.resolveFS(parent)])
            .then(function(entries){
                //TODO: check if are really files
                LOG.d("copyFileTo", entries);
                return new Promise(function(resolve, reject){
                    entries[0].copyTo(entries[1], newFilename, resolve, reject);
                });
            });
    };

    /**
     * */
    File.copyDir = function(source, destination){
        var newFolderName = destination.substring(destination.lastIndexOf('/')+1);
        var parent = destination.replace(newFolderName, "");

        return Promise.all([File.resolveFS(source), File.resolveFS(parent)])
            .then(function(entries){
                LOG.d("copyDir", source, "in",destination);
                return new Promise(function(resolve, reject){
                    entries[0].copyTo(entries[1], newFolderName, resolve, reject);
                });
            });
    };


    /**
     * __transform utils function
     * @private
     * @param {Array} entries - an array of Entry type object
     * @returns {Array.<Object>} - an array of Object
     * */
    function __transform(entries){
        var arr = entries.map(function(entry){
            return {
                fullPath:entry.fullPath,
                path:entry.toURL(),
                internalURL:entry.toInternalURL(),
                isFile:entry.isFile,
                isDirectory:entry.isDirectory
            };
        });
        return (arr.length == 1) ? arr[0] : arr;
    }
    _modules.file = File;
    return File;

})(stargateModules, stargateModules.Logger);
/**globals Promise, cordova **/
/**
 * Game module
 * @module src/modules/Game
 * @type {Object}
 * @requires ./Logger.js,./File.js
 */
(function(fileModule, Logger, _modules){
    "use strict";
    var baseDir,
        cacheDir,
        tempDirectory,
        constants = {},
        wwwDir,
        dataDir,
        stargatejsDir,
        SDK_URL = "http://s2.motime.com/js/wl/webstore_html5game/gfsdk/dist/gfsdk.js",
        DIXIE_URL = "http://s2.motime.com/tbr/dixie.js?country=it-igames";
    
    // GAMEINFO object
    //
    // GET /gameplay?<content_id>
    // fileModule.write(response)
    // 
    // inject in game fileModule.readFileAsJson(gameinfo.json)
    var LOG = new Logger("ALL", "[Game - module]");

    /**
     * @constructor
     * @alias module:src/modules/Game
     * @example
     * Stargate.game.download(gameObject, {onStart:function(){},onEnd:function(){},onProgress:function(){}})
     * .then(function(results){
     *  Stargate.game.play(results[0]) // and you leave this planet
     * });
     * */
    function Game(){}

    /**
     * Init must be called after the 'deviceready' event
     * @returns {Promise<Array<boolean>>}
     * */
     function initialize(conf){
        LOG.d("Initialized called with:", conf);
        if(!fileModule){return Promise.reject("Missing file module!");}


        try{
            baseDir = window.cordova.file.applicationStorageDirectory;
            cacheDir = window.cordova.file.cacheDirectory;
            tempDirectory = window.cordova.file.tempDirectory;
            wwwDir = window.cordova.file.applicationDirectory + "www/";
            stargatejsDir = window.cordova.file.applicationDirectory + "www/js/stargate.js";
            dataDir = window.cordova.file.dataDirectory;
        }catch(reason){
            LOG.e(reason);
            return Promise.reject(reason);
        }


        LOG.i("cordova JS dir to include", constants.CORDOVAJS);
        /**
         * Putting games under Documents r/w. ApplicationStorage is read only
         * on android ApplicationStorage is r/w
         */
        if(window.device.platform.toLowerCase() == "ios"){baseDir += "Documents/";}
        if(window.device.platform.toLowerCase() == "android"){tempDirectory = cacheDir;}

        constants.SDK_DIR = baseDir + "scripts/";
        constants.SDK_RELATIVE_DIR = "../../scripts/";
        constants.GAMEOVER_RELATIVE_DIR = "../../gameover_template/";        
        constants.GAMES_DIR = baseDir + "games/";
        constants.BASE_DIR = baseDir;
        constants.CACHE_DIR = cacheDir;
        constants.TEMP_DIR = tempDirectory;
        constants.CORDOVAJS = wwwDir + "cordova.js";
        constants.CORDOVA_PLUGINS_JS = wwwDir + "cordova_plugins.js";
        constants.STARGATEJS = wwwDir + "js/stargate.js";
        constants.DATA_DIR = dataDir;
        constants.GAMEOVER_DIR = constants.BASE_DIR + "gameover_template/";
        constants.WWW_DIR = wwwDir;

        /** expose games dir */
        _modules.game._public.GAMES_DIR = constants.GAMES_DIR;
        
        function firstInit(){
            /**
             * Create directories
             * */
            var gamesDirTask = fileModule.createDir(constants.BASE_DIR, "games");
            var scriptsDirTask = fileModule.createDir(constants.BASE_DIR, "scripts");
        
            return Promise.all([
                    gamesDirTask, 
                    scriptsDirTask
                ]).then(function(results){
                    LOG.d("GamesDir and ScriptsDir created", results);
                    LOG.d("Getting SDK from:", SDK_URL);
                    return Promise.all([
                        fileModule.download(SDK_URL, results[1].path, "gfsdk.min.js"),
                        fileModule.download(DIXIE_URL, results[1].path, "dixie.js"),
                        fileModule.copyDir(constants.WWW_DIR + "gameover_template", constants.BASE_DIR + "gameover_template"),
                        fileModule.copyDir(constants.WWW_DIR + "plugins", constants.SDK_DIR + "plugins"),
                        fileModule.copyFile(constants.CORDOVAJS, constants.SDK_DIR + "cordova.js"),
                        fileModule.copyFile(constants.CORDOVA_PLUGINS_JS, constants.SDK_DIR + "cordova_plugins.js"),
                        fileModule.copyFile(constants.STARGATEJS, constants.SDK_DIR + "stargate.js")                    
                    ]);                
                });    
        }

        //Object.freeze(constants);

        var gamesDirTaskExists = fileModule.dirExists(constants.GAMES_DIR);
        var SDKExists = fileModule.fileExists(constants.SDK_DIR + "gfsdk.min.js");
        
        return Promise.all([
                gamesDirTaskExists, 
                SDKExists])
            .then(function(results){
                if(!results[0] && !results[1]){
                    return firstInit();
                }else{
                    return Promise.resolve(true);
                }
            });       
    }

    /**
     * download the game and unzip it
     *
     * @param {object} gameObject - The gameObject with the url of the html5game's zip
     * @param {object} [callbacks={}] - an object with start-end-progress callbacks
     * @param [callbacks.onProgress=function(){}] - a progress function filled with the percentage
     * @param [callbacks.onStart=function(){}] - called on on start
     * @param [callbacks.onEnd=function(){}] - called when unzipped is done
     * @returns {Promise<boolean|FileError|Number>} - true if all has gone good, 403 if unathorized, FileError in case can write in the folder
     * */
    Game.prototype.download = function(gameObject, callbacks){
        if(this.isDownloading()){ return Promise.reject(["Downloading...try later", fileModule.currentFileTransfer]);}
        var alreadyExists = fileModule.dirExists(constants.GAMES_DIR + gameObject.id);

        // Defaults
        callbacks = callbacks ? callbacks : {};
        var _onProgress = callbacks.onProgress ? callbacks.onProgress : function(){};
        var _onStart = callbacks.onStart ? callbacks.onStart : function(){};
        var _onEnd = callbacks.onEnd ? callbacks.onEnd : function(){};

        /**
         * Decorate progress function with percentage and type operation
         */
        function wrapProgress(type){
            return function(progressEvent){
                //LOG.d(progressEvent);
                var percentage = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                _onProgress({percentage:percentage,type:type});
            };
        }

        var saveAsName = gameObject.id;
        function start(){
            _onStart({type:"download"});
            LOG.d("Download:", gameObject.id, gameObject.response_api_dld.binary_url);
            return fileModule.download(gameObject.response_api_dld.binary_url, constants.TEMP_DIR, saveAsName + ".zip", wrapProgress("download"))
                .then(function(entry){
                    //Unpack
                    _onStart({type:"unzip"});
                    LOG.d("unzip:", gameObject.id, constants.TEMP_DIR + saveAsName);
                    return fileModule._promiseZip(entry.path, constants.TEMP_DIR + saveAsName, wrapProgress("unzip"));
                })
                .then(function(result){
                    //Notify on end unzip
                    LOG.d("Unzip ended", result);
                    _onEnd({type:"unzip"});

                    /** check levels of folders before index **/
                    var str = gameObject.response_api_dld.url_download;
                    var folders = str.substring(str.lastIndexOf("game"), str.length).split("/");

                    var src = "";
                    LOG.d("Get the right index folder of the game",folders);

                    // In this case i have another folder before index.html
                    if(folders.length > 2 && isIndexHtml(folders[folders.length - 1])){
                        src = constants.TEMP_DIR + [saveAsName, folders[folders.length - 2]].join("/");
                        LOG.d("More than one level folders before index.html",folders, src);
                    }else{
                        src = constants.TEMP_DIR + saveAsName;
                        LOG.d("One level folder before index.html",folders, src);
                    }

                    LOG.d("Copy game folder in games/", src, constants.GAMES_DIR + saveAsName);                    
                    return fileModule.moveDir(src, constants.GAMES_DIR + saveAsName);                   
                })
                .then(function(result){
                    //Remove the zip in the temp directory
                    LOG.d("Remove zip from:", constants.TEMP_DIR + saveAsName + ".zip", "last operation result", result);
                    return fileModule.removeFile(constants.TEMP_DIR + saveAsName + ".zip");
                })
                .then(function(){
                    LOG.d("Save meta.json for:", gameObject.id);
                    return fileModule.createFile(constants.GAMES_DIR + saveAsName, "meta.json")
                        .then(function(entry){                            
                            return fileModule.write(entry.path, JSON.stringify(gameObject));
                        });
                })
                .then(function(result){
                    
                    //TODO: inject gameover css
                    LOG.d("result last operation:save meta.json", result);
                    LOG.d("InjectScripts in game:", gameObject.id, wwwDir);                    
                    return injectScripts(gameObject.id, [
                                constants.GAMEOVER_RELATIVE_DIR + "gameover.css",
                                constants.SDK_RELATIVE_DIR + "cordova.js",
                                constants.SDK_RELATIVE_DIR + "dixie.js",
                                constants.SDK_RELATIVE_DIR + "cordova_plugins.js",
                                constants.SDK_RELATIVE_DIR + "gfsdk.min.js",
                                constants.SDK_RELATIVE_DIR + "stargate.js"
                            ]);
                }).then(function(results){
                    LOG.d("injectScripts result", results);
                    _onEnd({type:"download"});
                    return gameObject.id;
                });
        }

        return alreadyExists.then(function(exists){
            LOG.d("Exists", exists);
            if(exists){
                return Promise.reject({12:"AlreadyExists",gameID:gameObject.id});
            }else{
                return start();
            }
        });

    };

    /**
     * play
     *
     * @param {String} gameID - the game path in gamesDir where to look for. Note:the game is launched in the same webview
     * @returns {Promise}
     * */
    Game.prototype.play = function(gameID){
        LOG.d("Play", gameID);
        /*
         * TODO: check if games built with Construct2 has orientation issue
         * attach this to orientationchange in the game index.html
         * if(cr._sizeCanvas) window.cr_sizeCanvas(window.innerWidth, window.innerHeight)
         */
        var gamedir = constants.GAMES_DIR + gameID;
        return fileModule.readDir(gamedir)
            .then(function(entries){

                //Search for an /index.html$/
                return entries.filter(function(entry){
                    var isIndex = new RegExp(/index\.html$/i);
                    return isIndex.test(entry.path);
                });
            })
            .then(function(entry){
                LOG.d(entry);
                var address = entry[0].internalURL + "?hybrid=1";
                if(window.device.platform.toLowerCase() == "ios"){
                    LOG.d("Play ios", address);
                    window.location.href = address;
                }else{
                    LOG.d("Play android", address);
                    //window.location.href = entry[0].path;
                    window.navigator.app.loadUrl(encodeURI(address));
                }
            });
    };

    /**
     * Returns an Array of entries that match /index\.html$/i should be only one in the game directory
     * @private
     * @param {String} gameID
     * @returns {Promise<Array|FileError>}
     * */
    function _getIndexHtmlById(gameID){
        LOG.d("_getIndexHtmlById", constants.GAMES_DIR + gameID);
        return fileModule.readDir(constants.GAMES_DIR + gameID)
            .then(function(entries){
                LOG.d("_getIndexHtmlById readDir", entries);
                return entries.filter(function(entry){
                    var isIndex = new RegExp(/index\.html$/i);
                    return isIndex.test(entry.path);
                });
            });
    }

    /**
     * removeRemoteSDK from game's dom
     *
     * @private
     * @param {Document} dom - the document object
     * @returns {Document} the cleaned document element
     * */
    function _removeRemoteSDK(dom){
        LOG.d("_removeRemoteSDK");
        var scripts = dom.querySelectorAll("script");
        var scriptTagSdk;
        for(var i = 0;i < scripts.length;i++){
            if(scripts[i].src.indexOf("gfsdk") !== -1){
                scriptTagSdk = scripts[i];
                LOG.d("_removeRemoteSDK", scriptTagSdk);
                scriptTagSdk.parentNode.removeChild(scriptTagSdk);
                break;
            }
        }
        return dom;
    }

    /**
     * _injectScriptsInDom
     *
     * @private
     * @param {Document} dom - the document where to inject scripts
     * @param {Array|String} sources - the src tag string or array of strings
     * */
    function _injectScriptsInDom(dom, sources){
        dom = _removeRemoteSDK(dom);
        var _sources = Array.isArray(sources) === false ? [sources] : sources;
        var temp;
        LOG.d("injectScripts", _sources);
        // Allow scripts to load from local cdvfile protocol
        // default-src * data: cdvfile://* content://* file:///*;
        var metaTag = document.createElement("meta");
        metaTag.httpEquiv = "Content-Security-Policy";
        metaTag.content = "default-src * " +
            "data: " +
            "content: " +
            "cdvfile: " +
            "file: " +
            "http: " +
            "https: " +
            "gap: " +
            "https://ssl.gstatic.com " +
            "'unsafe-inline' " +
            "'unsafe-eval';" +
            "style-src * cdvfile: http: https: 'unsafe-inline';";
        dom.head.appendChild(metaTag);
        for(var i = 0;i < _sources.length;i++){
            if(_sources[i].endsWith(".css")){
                LOG.d("css inject:",_sources[i]);
                var css = dom.createElement("link");
                css.rel = "stylesheet";
                css.href = _sources[i];
                dom.head.appendChild(css);
            }else{
                //TODO: better perfomance with document fragment?
                temp = document.createElement("script");
                temp.src = _sources[i];
                dom.head.appendChild(temp);     
            }           
        }
        LOG.d("Cleaned dom:",dom);
        return dom;
    }

    /**
     * injectScripts in game index
     *
     * @private
     * @param {String} gameID
     * @param {Array} sources - array of src'string
     * @returns {Promise<Object|FileError>}
     * */
    function injectScripts(gameID, sources){
        var indexPath;
        return _getIndexHtmlById(gameID)
            .then(function(entry){
                indexPath = entry[0].path;
                //LOG.d("injectScripts", indexPath);

                return fileModule.readFileAsHTML(entry[0].path);
            })
            .then(function(dom){
                // TODO: injectLocalSDK and other scripts with one call

                LOG.d("_injectScripts"); LOG.d(dom);
                return _injectScriptsInDom(dom, sources);

            })
            .then(function(dom){
                LOG.d("Serialize dom");
                var result = new XMLSerializer().serializeToString(dom);
                var toReplace = "<html xmlns=\"http:\/\/www.w3.org\/1999\/xhtml\"";
                result = result.replace(toReplace, "<html");
                return result;
            })
            .then(function(htmlAsString){
                LOG.d("Write dom:",indexPath,htmlAsString);
                return fileModule.write(indexPath, htmlAsString);
            });
    }

    function isIndexHtml(theString){
        var isIndex = new RegExp(/index\.html$/i);
        return isIndex.test(theString);
    }

    /**
     * remove the game directory
     *
     * @public
     * @param {string} gameID - the game id to delete on filesystem
     * @returns {Promise<boolean|FileError>}
     * */
    Game.prototype.remove = function(gameID){
        return fileModule.removeDir(constants.GAMES_DIR + gameID);
    };

    /**
     * isDownloading
     *
     * @public
     * @returns {boolean}
     * */
    Game.prototype.isDownloading = function(){
        return (fileModule.currentFileTransfer !== null || fileModule.currentFileTransfer === undefined);
    };

    /**
     * abortDownload
     *
     * @public
     * @returns {boolean}
     * */
    Game.prototype.abortDownload = function(){
        if(this.isDownloading()){
            fileModule.currentFileTransfer.abort();
            fileModule.currentFileTransfer = null;
            return true;
        }
        LOG.w("There's not a download operation to abort");
        return false;
    };

    /**
     * list
     *
     * @public
     * @returns {Array<Object>} - Returns an array of metainfo game object
     * */
    Game.prototype.list = function(){
        return fileModule.readDir(constants.GAMES_DIR)
            .then(function(entries){
                var _entries = Array.isArray(entries) ? entries : [entries];
                return _entries.map(function(entry){
                    //get the ids careful: there's / at the end
                    return entry.path;
                });
            }).then(function(ids){

                var jsons = ids.map(function(id){
                    return fileModule.readFileAsJSON(id + "meta.json");
                });

                return Promise.all(jsons).then(function(results){
                    return results;
                });
            });
    };
    
    /**
     * buildGameOver
     * 
     * @param {Object} datas - the data score, start, duration
     * @param datas.score
     * @param datas.start
     * @param datas.duration
     * @param datas.content_id
     * @returns {Promise} - The promise will be filled with the gameover html {String}     
     */
    Game.prototype.buildGameOver = function(datas){                 
        var metaJsonPath = constants.GAMES_DIR + datas.content_id + "/meta.json";
        /** Check if content_id is here */
        if(!datas.hasOwnProperty("content_id")){ return Promise.reject("Missing content_id key!");}
        
        LOG.d("Read meta.json:", metaJsonPath);
        LOG.d("GAMEOVER_TEMPLATE path", constants.GAMEOVER_DIR + "gameover.html");
        
        return Promise.all([
            fileModule.readFileAsJSON(metaJsonPath),
            fileModule.readFile(constants.GAMEOVER_DIR + "gameover.html")
        ]).then(function(results){
                var htmlString = results[1];
                var metaJson = results[0];                
                return htmlString
                    .replace("{{score}}", datas.score)
                    .replace("{{url_share}}", metaJson.url_share)
                    .replace("{{url_cover}}", metaJson.url_cover)                    
                    .replace("{{startpage_url}}", constants.WWW_DIR + "startpage.html");              
        });
    };
    
    var _protected = {};
    _modules.game = {};

    _protected.initialize = initialize;
    _modules.game._protected = _protected;
    _modules.game._public = new Game();

})(stargateModules.file, stargateModules.Logger, stargateModules);