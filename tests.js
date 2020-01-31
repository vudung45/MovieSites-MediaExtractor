import PhimMoiMediaExtractor from "./phimmoi.js";
import KhoaiTVMediaExtractor from "./khoaitv.js";
import BiluTVMediaExtractor from "./bilutv.js"
import webdriver from 'selenium-webdriver';

let khoaitv_test = new KhoaiTVMediaExtractor("http://khoaitv.org/phim/dreaming-back-to-the-qing-dynasty-mong-hoi-dai-thanh-13422");
khoaitv_test.extractMedia().then(r => console.log(r));


(async function bilutv() {
	let driver =  await new webdriver.Builder().withCapabilities(webdriver.Capabilities.firefox()).build();
	let bilutv_test = new BiluTVMediaExtractor('https://bilutv.org/phim-tam-sinh-tam-the-cham-thuong-thu-12627.html', driver);
	await bilutv_test.extractMedia().then(r => console.log(r)).catch(e => console.log(e));
	await driver.close()
})();
