import PhimMoiMediaExtractor from "./phimmoi.js";
import KhoaiTVMediaExtractor from "./khoaitv.js";
import BiluTVMediaExtractor from "./bilutv.js"


(async function() {
let khoaitv_test = new KhoaiTVMediaExtractor("http://khoaitv.org/phim/dreaming-back-to-the-qing-dynasty-mong-hoi-dai-thanh-13422");
	khoaitv_test.extractMedias().then(r => {
		console.log(`[TEST 1] get media srcs for: http://khoaitv.org/phim/dreaming-back-to-the-qing-dynasty-mong-hoi-dai-thanh-13422`);
		console.log(r);
		}
	);
})();



(async function() {
	let bilutv_test = new BiluTVMediaExtractor('https://bilutv.org/phim-tan-tuyet-dai-song-kieu-tap-1-12626.148969.html');
	await bilutv_test.extractMedias().then(r => {
		console.log(`[TEST 2] get media srcs for: https://bilutv.org/phim-tan-tuyet-dai-song-kieu-tap-1-12626.148969.html`);
		console.log(r);
	}).catch(e => console.log(e));
})();


(async function() {
	let bilutv_test = new BiluTVMediaExtractor('https://bilutv.org/phim-tien-tri-than-tham-tap-1-16207.192506.html');
	await bilutv_test.extractMedias().then(r => {
		console.log(`[TEST 3] get media srcs for: https://bilutv.org/phim-tien-tri-than-tham-tap-1-16207.192506.html`);
		console.log(r);
	}).catch(e => console.log(e));
})();
