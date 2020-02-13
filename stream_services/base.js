import Cacheable from "../utils/cacheable.js";

export default class StreamingService extends Cacheable{
	constructor(cacheManager, cachePrefix="StreamingService", functions=["getMediaSource"]) {
		super(cacheManager, cachePrefix, functions);

	}
    
	async getMediaSource(aux) {
        throw "not implemenented";
	}

   

}