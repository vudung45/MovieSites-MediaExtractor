import express from "express";
import {
    setupLocalCache
} from "../../../utils/localcachesetup.js"
import Hydrax from "../../../stream_services/hydrax.js"
import LocalJsonCacheManager from "../../../cache_manager/localjsoncache.js"
import DIDSoftProxy from "../../../proxy_services/didproxy.js"
import KhoaiTVMediaExtractor from "../../../sites/khoaitv/mediaextractor.js";
import XemPhimPlusMediaExtractor from "../../../sites/xemphimplus/mediaextractor.js";
import BiluTVMediaExtractor from "../../../sites/bilutv/mediaextractor.js";
import FimFastMediaExtractor from "../../../sites/fimfast/mediaextractor.js";
import VuViPhimmoiMediaExtractor from "../../../sites/vuviphimmoi/mediaextractor.js";
import MotphimMediaExtrator from "../../../sites/motphim/mediaextractor.js";


// let proxyCache = new LocalJsonCacheManager({
//     "path": "./cache_files/proxy.cache",
//     "ttl": 3600, // rescan every hour
//     "syncRoutine": true,
// });

// DIDSoftProxy.useCache(proxyCache);
// Hydrax.useProxyManager(DIDSoftProxy);


// Setup cache for MediaExtractors, and StreamServices
setupLocalCache(); //setup localcache

const router = express.Router();

async function driver(url) {
    let mediaSources = null;
    if (url.includes("bilutv.org") || url.includes("bilumoi.com")) {
        let regexMatch = url.match(/.*?-(\d*?)\.(\d*?)\.html/);
        if (!regexMatch) {
            throw `Invalid bilutv/bilumoi url format: ${url}`;
        }

        let movieId = regexMatch[1];
        let episodeId = regexMatch[2];
        try {
            mediaSources = await BiluTVMediaExtractor.extractMedias({
                movieID: movieId,
                episodeID: episodeId
            });
        } catch (e) {
            console.log(e);
            throw "Error while getting media sources for " + url;
        }
    } else if (url.includes("vuviphimm")) {
        let regexMatch = url.match(/.*?-phim-(.*?)-(\d*)$/);
        if (!regexMatch) {
            throw `Invalid vuviphimm url format: ${url}`;
        }

        let movieId = regexMatch[1];
        let episodeId = regexMatch[2];
        try {
            mediaSources = await VuViPhimmoiMediaExtractor.extractMedias({
                movieID: movieId,
                episodeID: episodeId
            });
        } catch (e) {
            console.log(e);
            throw "Error while getting media sources for " + url;
        }

    } else if (url.includes("motphim")) {
        let regexMatch = url.match(/.*-(\d*)_(\d*)\.html/);
        if (!regexMatch) {
            throw `Invalid motphim url format: ${url}`;
        }

        let movieId = regexMatch[1];
        let episodeId = regexMatch[2];
        try {
            mediaSources = await MotphimMediaExtrator.extractMedias({
                movieID: movieId,
                episodeID: episodeId
            });
        } catch (e) {
            console.log(e);
            throw "Error while getting media sources for " + url;
        }
    } else if (url.includes("khoaitv")) {
        let regexMatch = url.match(/.*-(\d*)-tap-(\d*)$/);
        if (!regexMatch) {
            throw `Invalid khoaitv url format: ${url}`;
        }

        let movieId = regexMatch[1];
        let episodeId = regexMatch[2];
        try {
            mediaSources = await KhoaiTVMediaExtractor.extractMedias({
                movieID: movieId,
                episodeID: episodeId
            });
        } catch (e) {
            console.log(e);
            throw "Error while getting media sources for " + url;
        }
    } else if (url.includes("xemphimplus")) {
        let regexMatch = url.match(/.*xem-phim-(.*)\/(.*)-sv(\d*).html$/);
        if (!regexMatch) {
            throw `Invalid xemphimplus url format: ${url}`;
        }

        let movieId = regexMatch[1];
        let episodeId = regexMatch[2];
        let svID = regexMatch[3]
        try {
            mediaSources = await XemPhimPlusMediaExtractor.extractMedias({
                movieID: movieId,
                episodeID: episodeId,
                svID: svID
            });
        } catch (e) {
            console.log(e);
            throw "Error while getting media sources for " + url;
        }
    } else if (url.includes("fimfast")) {
        let regexMatch = url.match(/.*\/(.*?)\/tap-(\d*?)/);
        if (!regexMatch) {
            throw `Invalid fimfast url format: ${url}`;
        }

        let movieId = regexMatch[1];
        let episodeId = regexMatch[2];
        try {
            mediaSources = await FimFastMediaExtractor.extractMedias({
                movieID: movieId,
                episodeID: episodeId
            });
        } catch (e) {
            console.log(e);
            throw "Error while getting media sources for " + url;
        }
    } else {
        throw url + " is currently not supported!";
    }
    return mediaSources;
}

// Get Movies
router.get("/", async (req, res) => {
    try {
        if (req.query.url) {
            let url = req.query.url;
            let mediaSources = await driver(url);
            // kinda a hack to replace LOCAL_DIR with current domain :)
            mediaSources = JSON.parse(JSON.stringify(mediaSources).replace(/LOCAL_DIR/g, "//"+ req.headers.host + "/pastes"));

            res.json({
                status: 1,
                response: mediaSources
            });
        } else {
            throw "Missing param url"
        }
    } catch (e) {
        res.json({
            status: 0,
            error: e.toString()
        });
    }
});

module.exports = router;