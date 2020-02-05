
export default class StreamingService {
	constructor(cacheManager, cachePrefix="") {
		this.cacheManager =  cacheManager;
        this.cachePrefix = cachePrefix;

	}

	async getMediaSource(aux) {

	}

    _prefixifyData(data) {
        return `${this.cachePrefix}_${data}`
    }

	useCache(cacheManager) {
		this.cacheManager = cacheManager;
	}

}