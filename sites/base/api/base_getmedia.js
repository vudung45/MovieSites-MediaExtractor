

export default class SiteMedia {
    constructor(cacheManager=null, cachePrefix="BiluTVAPI") {
        this.cacheManager = cacheManager;
        this.cachePrefix = cachePrefix
    }

    useCache(cacheManager) {
        this.cacheManager = cacheManager;
    }

    _prefixifyData(data) {
        return `${this.cachePrefix}_${data}`
    }


    async getMediaMetadata(aux, forceRefresh=false) {
        /* return unprocessed metadata to later on be used for scraping media source */

        let data = null;
        if(this.cacheManager != null && !forceRefresh)
            data = await this.cacheManager.load(this._prefixifyData(JSON.stringify(aux)));

        if(data)
            return data;

        data = await this._manual_getMediadata(aux);
        if(data && this.cacheManager != null) //cache
            await this.cacheManager.update(this._prefixifyData(JSON.stringify(aux)), data);
        
        return data;
    }

    async _manual_getMediadata(aux) {
    }
}