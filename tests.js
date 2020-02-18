// import PhimMoiMediaExtractor from "./sites/phimmoi/phimmoi.js";
import KhoaiTVMediaExtractor from "./sites/khoaitv/mediaextractor.js";
import BiluTVMediaExtractor from "./sites/bilutv/mediaextractor.js"
import VuViPhimmoiMediaExtractor from "./sites/vuviphimmoi/mediaextractor.js"
import MotphimMediaExtrator from "./sites/motphim/mediaextractor.js"
import { Hydrax } from './stream_services/services.js'
import { getSupportedSites, moduleUseCache, getStreamServices,getRedirectLink} from './utils/helper.js'
import LocalJsonCacheManager from './cache_manager/localjsoncache.js'
import request from 'request-promise';



// setup cache for site apis
let apiCache = new LocalJsonCacheManager({
	"path": "./cache_files/siteAPI.cache"
}, false);

let supportedSites = getSupportedSites(__dirname+"/sites");
supportedSites.map(site => {
	moduleUseCache(__dirname+`/sites/${site}/api/mediametadata.js`, apiCache);
});


// setup cache for streaming services
let streamServices = getStreamServices(__dirname+"/stream_services");
let streamCache = new LocalJsonCacheManager({
	"path":   "./cache_files/stream.cache"
}, false);

streamServices.map(site => {
	moduleUseCache(__dirname+`/stream_services/${site}.js`, streamCache);
});


/* TESTS */

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
	BiluTVMediaExtractor.extractMedias({
			"movieID" : 12626,
			"episodeID": 148969
	}).then(r => {
		console.log(`[TEST 2] get media srcs for: https://bilutv.org/phim-tan-tuyet-dai-song-kieu-tap-1-12626.148969.html`);
		console.log(r);
	}).catch(e => console.log(e));
})();


(async function() {
	BiluTVMediaExtractor.extractMedias({
			"movieID" : 16207,
			"episodeID": 192506
	}).then(r => {
		console.log(`[TEST 3] get media srcs for: https://bilutv.org/phim-tien-tri-than-tham-tap-1-16207.192506.html`);
		console.log(r);
	}).catch(e => console.log(e));
})();

(async function() {
	BiluTVMediaExtractor.extractMedias({
			"movieID" : 14123,
			"episodeID": 174369
	}).then(r => {
		console.log(`[TEST 4] get media srcs for: https://bilutv.org/phim-tran-tinh-lenh-ban-dac-biet-tap-1-14123.174369.html`);
		console.log(r);
	}).catch(e => console.log(e));
})();

(async function() {
	VuViPhimmoiMediaExtractor.extractMedias({
			"movieID" : "diep-van-phan-4",
			"episodeID": 267274
	}).then(r => {
		console.log(`[TEST 5] get media srcs for: https://vuviphimmoi.com/xem-phim-diep-van-phan-4-267274`);
		console.log(r);
	}).catch(e => console.log(e));
})();

(async function() {
	VuViPhimmoiMediaExtractor.extractMedias({
			"movieID" : "van-gioi-than-chu",
			"episodeID": 226988
	}).then(r => {
		console.log(`[TEST 6] get media srcs for: https://vuviphimmoi.com/xem-phim-van-gioi-than-chu-226988`);
		console.log(r);
	}).catch(e => console.log(e));
})();


(async function() {
	let test = new MotphimMediaExtrator(7741, 97939);
	MotphimMediaExtrator.extractMedias({
			"movieID" : 7741,
			"episodeID": 97939
	}).then(r => {
		console.log(`[TEST 7] get media srcs for: https://motphim.net/xem-phim/thuong-co-mat-uoc-tap-1-7741_97939.html`);
		console.log(r);
	}).catch(e => console.log(e));
})();