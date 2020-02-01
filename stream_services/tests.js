import Hydrax from "./hydrax.js";
import LocalJsonCacheManager from '../cache_manager/localjsoncache.js'

let hydraxCache = new LocalJsonCacheManager({
	"path":  __dirname+'/cache/hydrax.cache'
}, false);

let _hydrax = new Hydrax(hydraxCache);

(async function(){
	console.log(await _hydrax.getMediaSource({
		"slug": "DAFBiqZVq",
		"key": "bf54163828fbcf4178fe249641b1f519"
	}));
})();

(async function(){
	console.log(await _hydrax.getMediaSource({
		"slug": "2CJ_icSgl"
	}));
})();