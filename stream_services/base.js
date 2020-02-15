import Cacheable from "../utils/cacheable.js";

export default class StreamingService extends Cacheable{
	constructor(cacheManager, cachePrefix="StreamingService", functions=["getMediaSource"]) {
		super(cacheManager, cachePrefix, functions);
        this.proxyManager = null;

	}

    async _getProxy(type="any"){
        return null;
    }

    useProxyManager(proxyManager) {
        this.proxyManager = proxyManager;
    }
    
	async getMediaSource(aux) {
        throw "not implemenented";
	}

   

}