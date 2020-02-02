import MediaExtractor from "./base.js";
import request from "async-request";


export default class PhimmoiMediaExtractor extends MediaExtractor {

	constructor(movieID, episodeID) {
		super(movieID, episodeID);
	}

	async extractMedias() {
		throw "Not implemented";
	}
}
