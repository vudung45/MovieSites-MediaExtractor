import MediaExtractor from './base.js'
import request from 'async-request';
import r from 'request';
import { parse } from 'node-html-parser';
import MediaSource from './mediasource.js';
import fs from 'fs';
import tough from 'tough-cookie';
import webdriver from 'selenium-webdriver';

let NUM_SOURCES = 4; // number of alternative movie sources

export default class BiluTVMediaExtractor extends MediaExtractor
{
	
	constructor(url, driver) {
		super(url);
		this.driver = driver;
	}

	async extractMedia() {
		let web = await this.driver.get(this.url); // load the page
		await this.driver.wait(async function(){
			return await this.driver.executeScript("try {return jQuery.active == 0;} catch(e) {return 0;}") == 1;
 
		}.bind(this));
		// parse the webpage source to extract movieID and episodeID
		let pageSource =await this.driver.getPageSource();
		let movieID = parseInt(pageSource.match(/MovieID( *)=( *)'\d*'/)[0].replace(/MovieID( *)=( *)/,"").replace("'",""));
		let episodeID = parseInt(pageSource.match(/EpisodeID( *)=( *)'\d*'/)[0].replace(/EpisodeID( *)=( *)/,"").replace("'",""));
		let source = NUM_SOURCES; 
		let availableMedias = [];
		//iterate through each alternative media sources, and attempt to crawl video source
		while(source-- > 0) {
			// execute ajax in browser environment to get video source
			let playerSrc = await this.driver.executeAsyncScript(`let callback = arguments[arguments.length - 1]; 
				$.ajax({type: 'POST', url: 'https://bilutv.org/ajax/player/', 
				        data: {id: ${movieID}, 
				        	   ep: ${episodeID}, 
				        	   sv: ${source}}, 
				       success: function(response) { callback(response)}, 
				       error: function(e) { callback(e)}});`);
			/* BiluTV supports both <iframe> and normal video mp4 media type */
			try {
				if(playerSrc.includes("box-player")) {
						let iframeUrl = playerSrc.match(/iframe (.*) src="(.*?)"/)[0].replace(/iframe (.*) src="/, '').replace('"', '');
						if(iframeUrl.charAt(0) == '/') // if the iframe source is a relative URL
							iframeUrl = "https://bilutv.org" + iframeUrl;
						availableMedias.push(new MediaSource(iframeUrl, "iframe").getJson);
				} else if(playerSrc.includes("<div class=\"player\">")) { // normal mp4 media type
					let sources = JSON.parse(playerSrc.match(/sources:( *)\[(.|\n)*?\]/)[0].replace(/sources:( *)/, ""));
					sources.map(m => availableMedias.push(new MediaSource(m["file"], m["type"], m["label"]).getJson()))
				}
			} catch (e) {
				//console.log(`Error: ${e}\nplayerSrc: ${playerSrc}`)
			}
		}
		return availableMedias;

	}

}
