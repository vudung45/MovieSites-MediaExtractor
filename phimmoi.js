import MediaExtractor from "./base.js";
import request from "async-request";


export default class PhimmoiMediaExtractor extends MediaExtractor {

	constructor(url) {
		super(url);
	}

	async extractMedia() {
		throw "Not implemented";
	}
}
