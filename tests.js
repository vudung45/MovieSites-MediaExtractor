// import PhimMoiMediaExtractor from "./sites/phimmoi/phimmoi.js";
import KhoaiTVMediaExtractor from "./sites/khoaitv/mediaextractor.js";
import BiluTVMediaExtractor from "./sites/bilutv/mediaextractor.js"
import { Hydrax } from './stream_services/services.js'
import { getSupportedSites, moduleUseCache} from './utils/helper.js'
import LocalJsonCacheManager from './cache_manager/localjsoncache.js'


// Ultilize cache for all sites's api modules
let supportedSites = getSupportedSites(__dirname+"/sites");

let apiCache = new LocalJsonCacheManager({
	"path":  __dirname+'/stream_services/cache/siteAPI.cache'
}, false);

supportedSites.map(site => {
	moduleUseCache(__dirname+`/sites/${site}/api/getmedia.js`, apiCache);
});


let streamCache = new LocalJsonCacheManager({
	"path":  __dirname+'/stream_services/cache/stream.cache'
}, false);

Hydrax.useCache(streamCache);

(async function() {
let khoaitv_test = new KhoaiTVMediaExtractor(13422,1);
	khoaitv_test.extractMedias().then(r => {
		console.log(`[TEST 1] get media srcs for: http://khoaitv.org/phim/dreaming-back-to-the-qing-dynasty-mong-hoi-dai-thanh-13422`);
		console.log(r);
		}
	);
})();

(async function() {
let khoaitv_test = new KhoaiTVMediaExtractor(13318,1);
	khoaitv_test.extractMedias().then(r => {
		console.log(`[TEST 1.5] get media srcs for: http://khoaitv.org/phim/joy-of-life-khanh-du-nien-13318-tap-1`);
		console.log(r);
		}
	);
})();


(async function() {
	let bilutv_test = new BiluTVMediaExtractor(12626, 148969);
	await bilutv_test.extractMedias().then(r => {
		console.log(`[TEST 2] get media srcs for: https://bilutv.org/phim-tan-tuyet-dai-song-kieu-tap-1-12626.148969.html`);
		console.log(r);
	}).catch(e => console.log(e));
})();


(async function() {
	let bilutv_test = new BiluTVMediaExtractor(16207, 192506);
	await bilutv_test.extractMedias().then(r => {
		console.log(`[TEST 3] get media srcs for: https://bilutv.org/phim-tien-tri-than-tham-tap-1-16207.192506.html`);
		console.log(r);
	}).catch(e => console.log(e));
})();

(async function() {
	let bilutv_test = new BiluTVMediaExtractor(14123, 174369);
	await bilutv_test.extractMedias().then(r => {
		console.log(`[TEST 4] get media srcs for: https://bilutv.org/phim-tran-tinh-lenh-ban-dac-biet-tap-1-14123.174369.html`);
		console.log(r);
	}).catch(e => console.log(e));
})();