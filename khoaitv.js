import MediaExtractor from './base.js'
import request from 'async-request';
import { parse } from 'node-html-parser';
import MediaSource from './mediasource.js'

/* 
 Problems:
	- Pretty simple schema. 
	- KhoaiTV enables cross-origins access and media source is eagerly loaded 
		so we don't have to do any workaround here
 Solution:
    - Parse the page source code for <iframe> tag
*/

export default class KhoaiTVMediaExtractor extends MediaExtractor
{
	constructor(url) {
		//http://khoaitv.org/phim/dreaming-back-to-the-qing-dynasty-mong-hoi-dai-thanh-13422-tap-1
		super(url);
	}

	async extractMedia() {
		let urlResp = await request(this.url);
		let html_parser = parse(urlResp.body);
		let iframeURL = html_parser.querySelector("iframe").rawAttrs.match(/src="(.*?)"/g)[0].replace('src="','').replace('"','');
		// now parse the iframe page
		urlResp = (await request(iframeURL)).body.match(/iframe src="(.*?)"/)[0].replace('iframe src="','').replace('"','');
		return [new MediaSource(urlResp, "iframe").getJson()];
	}

}
