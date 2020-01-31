import StreamingService from './base.js'
import { getVipHLSHydrax } from '../utils/hls.js'
import path from 'path';

export default class Hydrax extends StreamingService {
	constructor(cacheManager=null) {
		super(cacheManager);
	}

	async _getProxy(){
		return null;
	}

	async getMediaSource(aux) {
		let src = null;
		if(this.cacheManager != null){

			src = await this.cacheManager.load(JSON.stringify(aux));
		}
		if(src == null) {
			try {
				src = await getVipHLSHydrax(aux["slug"], aux["key"], aux["origin"], await this._getProxy(), "includeOrigin" in aux ? aux["includeOrigin"] : false);
			} catch (e) {
				console.log(e);
				return null;
			}
		}
		if(src && this.cacheManager)
			this.cacheManager.update(JSON.stringify(aux), src);

		return src;
	}

}