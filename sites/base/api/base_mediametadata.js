import Cacheable from "../../../utils/cacheable.js"
export default class SiteMediaMetadata extends Cacheable {
    constructor(cacheManager = null, cachePrefix = "BiluTVAPI", functions = ["getMediaMetadata"]) {
        super(cacheManager, cachePrefix, functions);
    }


    async getMediaMetadata() {
        throw "not yet implemented";
    }


}