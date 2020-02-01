
export default class StreamingService {
	constructor(cacheManager) {
		this.cacheManager =  cacheManager;
	}

	async getMediaSource(aux) {

	}

	useCache(cacheManager) {
		this.cacheManager = cacheManager;
	}

}