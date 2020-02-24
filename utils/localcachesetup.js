import LocalJsonCacheManager from '../cache_manager/localjsoncache.js'
import {
    getProp,
    getSupportedSites,
    getStreamServices,
    moduleUseCache
} from '../utils/helper.js'

let CACHE_MANAGER_SETTINGS = {
    "default": {
        path: "./cache_files/default.cache",
        ttl: 60 * 30, // 30 mins
        syncRoutine: true
    },
    "defaultMirrorsCache": {
        path: "./cache_files/defaultMirrors.cache",
        ttl: 60 * 60 * 24 * 14, // 14 days 
        syncRoutine: true
    }
};

CACHE_MANAGER_SETTINGS[`${__dirname}/../stream_services/hydrax.js`] = {
    path: "./cache_files/hydrax.cache",
    ttl: 60 * 60 * 24,
    syncRoutine: true
};

export function setupLocalCache() {
    let CACHE_MANAGERS = {};
    for (const key of Object.keys(CACHE_MANAGER_SETTINGS))
        CACHE_MANAGERS[key] = new LocalJsonCacheManager(CACHE_MANAGER_SETTINGS[key]);

    let supportedSites = getSupportedSites(__dirname + "/../sites");
    supportedSites.map(site => {
        moduleUseCache(__dirname + `/../sites/${site}/api/mediametadata.js`,
            getProp(CACHE_MANAGERS, __dirname + `/../sites/${site}/api/mediametadata.js`, CACHE_MANAGERS["default"]));

        //cache procesed links (mirror links)
        moduleUseCache(__dirname + `/../sites/${site}/mediaextractor.js`,
            getProp(CACHE_MANAGERS, __dirname + `/../sites/${site}/mediaextractor.js`, CACHE_MANAGERS["defaultMirrorsCache"]));
    });


    // setup cache for streaming services
    let streamServices = getStreamServices(__dirname + "/../stream_services");
    streamServices.map(site => {
        moduleUseCache(__dirname + `/../stream_services/${site}.js`, getProp(CACHE_MANAGERS, __dirname + `/../stream_services/${site}.js`, CACHE_MANAGERS["default"]));
    });

}