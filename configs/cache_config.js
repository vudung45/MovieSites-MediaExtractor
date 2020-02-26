import urljoin from "url-join";
import LocalCacheManager from "../cache_manager/localjsoncache.js";



let config = {
    // ** M3U8 Generator cache
    "../m3u8_generator/standard_generator.js": {
        "cacheManager": LocalCacheManager,
        "settings": {
            "path": "./cache_files/m3u8-generator.cache",
            "ttl": 60 * 30, // 30 mins
            "syncRoutine": true
        }
    },
    // *** Cache settings for sites mediametadata ***
    "../sites/bilutv/api/mediametadata.js": {
        "cacheManager": LocalCacheManager,
        "settings": {
            "path": "./cache_files/bilutv-api.cache",
            "ttl": 60 * 30, // 30 mins
            "syncRoutine": true
        }
    },
    "../sites/khoaitv/api/mediametadata.js": {
        "cacheManager": LocalCacheManager,
        "settings": {
            "path": "./cache_files/khoaitv-api.cache",
            "ttl": 60 * 30, // 30 mins
            "syncRoutine": true
        }
    },
    "../sites/motphim/api/mediametadata.js": {
        "cacheManager": LocalCacheManager,
        "settings": {
            "path": "./cache_files/motphim-api.cache",
            "ttl": 60 * 30, // 30 mins
            "syncRoutine": true
        }
    },
    "../sites/vuviphimmoi/api/mediametadata.js": {
        "cacheManager": LocalCacheManager,
        "settings": {
            "path": "./cache_files/vuviphimmoi-api.cache",
            "ttl": 60 * 30, // 30 mins
            "syncRoutine": true
        }
    },
    "../sites/xemphimplus/api/mediametadata.js": {
        "cacheManager": LocalCacheManager,
        "settings": {
            "path": "./cache_files/xemphimplus-api.cache",
            "ttl": 60 * 30, // 30 mins
            "syncRoutine": true
        }
    },
    "../sites/fimfast/api/mediametadata.js": {
        "cacheManager": LocalCacheManager,
        "settings": {
            "path": "./cache_files/fimfast-api.cache",
            "ttl": 60 * 30, // 30 mins
            "syncRoutine": true
        }
    },

    // *** Cache settings for sites media extractor ***
    "../sites/khoaitv/mediaextractor.js": {
        "cacheManager": LocalCacheManager,
        "settings": {
            "path": "/cache_files/khoaitv-mirror.cache",
            "ttl": 60 * 60 * 24, // 1 days 
            "syncRoutine": true
        }
    },
    "../sites/bilutv/mediaextractor.js": {
        "cacheManager": LocalCacheManager,
        "settings": {
            "path": "./cache_files/bilutv-mirror.cache",
            "ttl": 60 * 60 * 24, // 1 days 
            "syncRoutine": true
        }
    },
    "../sites/motphim/mediaextractor.js": {
        "cacheManager": LocalCacheManager,
        "settings": {
            "path": "./cache_files/motphim-mirror.cache",
            "ttl": 60 * 60 * 24, // 1 days 
            "syncRoutine": true
        }
    },
    "../sites/vuviphimmoi/mediaextractor.js": {
        "cacheManager": LocalCacheManager,
        "settings": {
            "path": "./cache_files/vuviphimmoi-mirror.cache",
            "ttl": 60 * 60 * 24, // 1 days 
            "syncRoutine": true
        }
    },
    "../sites/xemphimplus/mediaextractor.js": {
        "cacheManager": LocalCacheManager,
        "settings": {
            "path": "./cache_files/xemphimplus-mirror.cache",
            "ttl": 60 * 60 * 24, // 1 days 
            "syncRoutine": true
        }
    },
    "../sites/fimfast/mediaextractor.js": {
        "cacheManager": LocalCacheManager,
        "settings": {
            "path": "./cache_files/fimfast-mirror.cache",
            "ttl": 60 * 60 * 24, // 1 days 
            "syncRoutine": true
        }
    },

    // *** Cache settings for streaming services ***
    "../stream_services/hydrax.js": {
        "cacheManager": LocalCacheManager,
        "settings": {
            "path": "./cache_files/hydrax.cache",
            "ttl": 60 * 60 * 24, //24 hrs
            "syncRoutine": true
        }
    },
    "../stream_services/motphim.js": {
        "cacheManager": LocalCacheManager,
        "settings": {
            "path": "./cache_files/motphim.cache",
            "ttl": 60 * 60 * 24, //24 hrs
            "syncRoutine": true
        }
    },
    "../stream_services/vuviphimxyz.js": {
        "cacheManager": LocalCacheManager,
        "settings": {
            "path": "./cache_files/vuviphimxyz.cache",
            "ttl": 60 * 60 * 24, //24 hrs
            "syncRoutine": true
        }
    },
}

for (let path of Object.keys(config)) {
    config[urljoin(__dirname, path)] = config[path];
    delete config[path];
}

module.exports = config;