import MediaExtractor from './base.js'
import request from 'async-request';
import r from 'request';
import {
    parse
} from 'node-html-parser';
import MediaSource from './mediasource.js';
import fs from 'fs';

let NUM_SOURCES = 4; // number of alternative movie sources
/* 
 Problems:
    - /ajax/player blocks cors
 Solution:
    - Modify Origin in request's headers
*/
export default class BiluTVMediaExtractor extends MediaExtractor {
    constructor(url) {
        super(url);
    }
    async extractMedia() {
        let web = await request(this.url); // load the page
        // parse the webpage source to extract movieID and episodeID
        let movieID = parseInt(web.body.match(/MovieID( *)=( *)'\d*'/)[0].replace(/MovieID( *)=( *)/, "").replace("'", ""));
        let episodeID = parseInt(web.body.match(/EpisodeID( *)=( *)'\d*'/)[0].replace(/EpisodeID( *)=( *)/, "").replace("'", ""));
        let source = NUM_SOURCES;
        let availableMedias = [];
        //iterate through each alternative media sources, and attempt to crawl video source
        while (source-- > 0) {
            // execute ajax in browser environment to get video source
            let playerSrc = (await request("https://bilutv.org/ajax/player/", 
            {
                "method": "POST",
                "headers": {
                    "Content-type" : "application/x-www-form-urlencoded; charset=UTF-8",
                    "User-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36",
                    "Origin": "https://bilutv.org",
                    "Referrer": "https://bilutv.org/",
                    "Accept-language": "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7,vi;q=0.6",
                },
                "data" :
                {
                    "id": movieID,
                    "ep": episodeID,
                    "sv": source
                }
            })).body;
            /* BiluTV supports both <iframe> and normal video mp4 media type */
            try {
                if (playerSrc.includes("box-player")) {
                    let iframeUrl = playerSrc.match(/iframe (.*) src="(.*?)"/)[0].replace(/iframe (.*) src="/, '').replace('"', '');
                    if (iframeUrl.charAt(0) == '/') // if the iframe source is a relative URL
                        iframeUrl = "https://bilutv.org" + iframeUrl;
                    availableMedias.push(new MediaSource(iframeUrl, "iframe").getJson());
                } else if (playerSrc.includes("<div class=\"player\">")) { // normal mp4 media type
                    let sources = JSON.parse(playerSrc.match(/sources:( *)\[(.|\n)*?\]/)[0].replace(/sources:( *)/, ""));
                    sources.map(m => availableMedias.push(new MediaSource(m["file"], m["type"], m["label"]).getJson()));
                }
            } catch (e) {
                //console.log(`Error: ${e}\nplayerSrc: ${playerSrc}`);
            }
        }
        return availableMedias;
    }
}