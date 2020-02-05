'use non-strict';

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

export function genHydraxURL(slug) {
    return `https://hydrax.net/watch?v=${slug}`;
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

export function unpackJS(p) {
    var p = p,
        c = p;
    var a = 10,
        x = 1;
    while (x < a) {
        c = unescape(c);
        if (/eval\(+function\(/.test(c)) {
            c = depack(c);
            x++
        } else {
            break
        }
    };
    c = unescape(c);
    return c;
}

function depack(p) {
    var c = "";
    if (p != "") {
        c = unescape(p);
        var _e = eval, s = "eval=function(v){c=v;};" + c + ";eval=_e;";
        eval(s);
    } else {
        c = p;
    };
    return c;
}