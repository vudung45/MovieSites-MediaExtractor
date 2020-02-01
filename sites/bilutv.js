import MediaExtractor from './base.js'
import request from 'async-request';
import {
    parse
} from 'node-html-parser';
import MediaSource from '../utils/mediasource.js';
import fs from 'fs';
import {Hydrax} from '../stream_services/services.js'
import { BiluTVAPI } from '../sites-api/wrappers.js'
/* 
 Problems:
    - /ajax/player blocks cors
 Solution:
    - Modify Origin in request's headers
*/

const NUM_SOURCES = 4; // number of alternative movie sources
const FAKE_HEADERS = {
        "Content-type" : "application/x-www-form-urlencoded; charset=UTF-8",
        "User-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36",
        "Origin": "https://bilutv.org",
        "Referrer": "https://bilutv.org/",
        "Accept-language": "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7,vi;q=0.6",
};

const AJAX_PLAYER_API = "https://bilutv.org/ajax/player/";

export default class BiluTVMediaExtractor extends MediaExtractor {
    constructor(movieID, episodeID) {
        super(movieID, episodeID);
    }

    async extractMedias() {
        // parse the webpage source to extract movieID and episodeID
        let source = NUM_SOURCES;
        let availableMedias = [];
        //iterate through each alternative media sources, and attempt to crawl video source
        while (source-- > 0) {
            try {
                // utilize BiluTVAPI wrapper class to take advantage of caching system
                let response = await BiluTVAPI.getMediaMetadata({
                    "movieID": this.movieID,
                    "episodeID": this.episodeID,
                    "sv": source
                });
                if(!response)
                    continue;

                if(response.type == "iframe") {
                    let iframeUrl = response.data;
                    // if the iframe is embeding source from HydraxMedia
                    if(iframeUrl.includes("slug")) {
                        try {
                            let urlObj = new URL(iframeUrl);
                            let hlsMedias = await Hydrax.getMediaSource({
                                slug: urlObj.searchParams.get("slug"), 
                                key: urlObj.searchParams.get("key"), 
                                origin: iframeUrl
                            });
                            
                            if(hlsMedias)
                                hlsMedias.map(m => availableMedias.push(m));
                        } catch(e) {
                           console.log(e);
                        }
                    }
                } else if(response.type == "video-sources") {
                    let sources = response.data;
                    if(!sources)
                        continue;

                    sources.map(m => {
                        if(m["file"] != "error")
                            availableMedias.push(new MediaSource(m["file"], m["type"], m["label"]).getJson());
                    });   
                }
            } catch (e) {
                console.log(`Error: ${e}`);
            }
        }
        return availableMedias;
    }
}