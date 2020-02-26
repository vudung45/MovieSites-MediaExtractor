import {
    extractHostname
} from "../../utils/helper.js"
import MediaSource from "../../utils/mediasource.js"
export default class MediaExtractor {
    constructor(prefix) {
        this.prefix = prefix;
    }

    useCache(cacheManager) {
        this.cacheManager = cacheManager;
    }


    _prefixifyKey(key) {
        return `${this.prefix}_${key}`
    }


    async extractMedias(aux) {
        let medias = await this._extractMedias(aux);
        console.log(medias)
        if (!this.cacheManager)
            return {
                "sources": medias,
                "mirrors": []
            };

        let cacheKey = this._prefixifyKey(JSON.stringify(aux));
        let cache = await this.cacheManager.load(cacheKey);
        if (!cache)
            cache = {};

        let permaMedias = {}; //previously processed permament video sources
        for (const origin of Object.keys(cache)) {
            permaMedias[origin] = [];
            cache[origin].forEach(rawBundle => {
                let mediaSourcesBundle = [];
                rawBundle.forEach(json => {
                    mediaSourcesBundle.push(MediaSource.createFrom(json));
                });
                permaMedias[origin].push(mediaSourcesBundle);
            })
        }

        Object.keys(medias).forEach(origin => {
            // origin is where the video sources originate from
            let bundles = medias[origin]; // List of bundles, each bundle contains multiple video sources of different quality/resolution
            let mirroredBundles = [];
            //iterate through each bundle, and check to see if any of them has perma mediasource
            bundles.forEach(bundle => {
                let mirrors = []
                bundle.forEach(mediasource => {
                    if (mediasource.permaLink)
                        mirrors.push(mediasource);
                });
                if (mirrors.length)
                    mirroredBundles.push(mirrors);
            });
            if (mirroredBundles.length) //cache this bundle
                cache[origin] = mirroredBundles;

        });
        await this.cacheManager.update(cacheKey, cache);
        return {
            "sources": medias,
            "mirrors": permaMedias
        }
    }



    async _extractMedias(aux) {
        throw "not yet implemented";
    }
}