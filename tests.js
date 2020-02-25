// import PhimMoiMediaExtractor from "./sites/phimmoi/phimmoi.js";
import KhoaiTVMediaExtractor from "./sites/khoaitv/mediaextractor.js";
import BiluTVMediaExtractor from "./sites/bilutv/mediaextractor.js"
import VuViPhimmoiMediaExtractor from "./sites/vuviphimmoi/mediaextractor.js"
import FimFastMediaExtractor from "./sites/fimfast/mediaextractor.js"
import MotphimMediaExtrator from "./sites/motphim/mediaextractor.js"
import XemPhimPlusMediaExtractor from "./sites/xemphimplus/mediaextractor.js"
import { Hydrax } from './stream_services/services.js'
import { getSupportedSites, moduleUseCache, getStreamServices,getRedirectLink} from './utils/helper.js'
import LocalJsonCacheManager from './cache_manager/localjsoncache.js'
import request from 'request-promise';


/* TESTS */

// (async function() {
// 	XemPhimPlusMediaExtractor.extractMedias({"movieID": "tang-lop-itaewon", "episodeID": 1}).then(r => {
// 		console.log(`[TEST 1] get media srcs for: http://xemphimplus.net/xem-phim-tang-lop-itaewon/1-sv1.html`);
// 		console.log(r);
// 		}
// 	);
// })();

(async function() {
	FimFastMediaExtractor.extractMedias({"movieID": "bao-dong-khan-tinh-yeu-ha-canh", "episodeID": 1}).then(r => {
		console.log(`[TEST 1] get media srcs for: https://fimfast.com/bao-dong-khan-tinh-yeu-ha-canh/tap-1`);
		console.log(r);
		}
	);
})();



// (async function() {
// 	BiluTVMediaExtractor.extractMedias({
// 			"movieID" : 12626,
// 			"episodeID": 148969
// 	}).then(r => {
// 		console.log(`[TEST 2] get media srcs for: https://bilutv.org/phim-tan-tuyet-dai-song-kieu-tap-1-12626.148969.html`);
// 		console.log(r);
// 	}).catch(e => console.log(e));
// })();


// (async function() {
// 	BiluTVMediaExtractor.extractMedias({
// 			"movieID" : 16207,
// 			"episodeID": 192506
// 	}).then(r => {
// 		console.log(`[TEST 3] get media srcs for: https://bilutv.org/phim-tien-tri-than-tham-tap-1-16207.192506.html`);
// 		console.log(r);
// 	}).catch(e => console.log(e));
// })();

// (async function() {
// 	BiluTVMediaExtractor.extractMedias({
// 			"movieID" : 14123,
// 			"episodeID": 174369
// 	}).then(r => {
// 		console.log(`[TEST 4] get media srcs for: https://bilutv.org/phim-tran-tinh-lenh-ban-dac-biet-tap-1-14123.174369.html`);
// 		console.log(r);
// 	}).catch(e => console.log(e));
// })();

// (async function() {
// 	VuViPhimmoiMediaExtractor.extractMedias({
// 			"movieID" : "diep-van-phan-4",
// 			"episodeID": 267274
// 	}).then(r => {
// 		console.log(`[TEST 5] get media srcs for: https://vuviphimmoi.com/xem-phim-diep-van-phan-4-267274`);
// 		console.log(r);
// 	}).catch(e => console.log(e));
// })();

// (async function() {
// 	VuViPhimmoiMediaExtractor.extractMedias({
// 			"movieID" : "van-gioi-than-chu",
// 			"episodeID": 226988
// 	}).then(r => {
// 		console.log(`[TEST 6] get media srcs for: https://vuviphimmoi.com/xem-phim-van-gioi-than-chu-226988`);
// 		console.log(r);
// 	}).catch(e => console.log(e));
// })();


// (async function() {
// 	MotphimMediaExtrator.extractMedias({
// 			"movieID" : 7741,
// 			"episodeID": 97939
// 	}).then(r => {
// 		console.log(`[TEST 7] get media srcs for: https://motphim.net/xem-phim/thuong-co-mat-uoc-tap-1-7741_97939.html`);
// 		console.log(r);
// 	}).catch(e => console.log(e));
// })();