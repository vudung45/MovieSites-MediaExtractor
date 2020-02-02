import fs from 'fs';


export function extractHostname(url) {
    let hostname;
    //find & remove protocol (http, ftp, etc.) and get hostname

    if (url.indexOf("//") > -1) {
        hostname = url.split('/')[2];
    }
    else {
        hostname = url.split('/')[0];
    }

    //find & remove port number
    hostname = hostname.split(':')[0];
    //find & remove "?"
    hostname = hostname.split('?')[0];

    return hostname;
}


export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function getProp(object, key, d=null){
    return object.hasOwnProperty(key) ? object[key] : d;
};


export function moduleUseCache(modulePath, cacheManager, _import="default"){

    try {
        let module = null;
        if(_import = "default") {
            module = require(modulePath);
        } else {
            module = require(modulePath)[_import];
        }
        module.useCache(cacheManager);
    } catch (e) {
        console.log(e);
    }

}

export function getSupportedSites(packagePath){
    let supportedSites = [];
    try {
        let files = fs.readdirSync(packagePath, { withFileTypes: true });
        files.map((f) => {
            if(f.isDirectory() && f.name != "base")
                supportedSites.push(f.name)
        });
    } catch (e) {
        console.log(e);
    }
    return supportedSites;

}