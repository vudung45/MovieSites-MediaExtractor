import MediaExtractor from '../base/base_mediaextractor.js'
import request from 'async-request';
import {
    parse
} from 'node-html-parser';
import MediaSource from '../../utils/mediasource.js';
import fs from 'fs';
import {simpleGetLinkDriver} from '../../stream_services/services.js'
import MediaMetadata from './api/mediametadata.js';
import {genHydraxURL} from '../../utils/helper.js';
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
        "Origin": "https://bilumoi.com",
        "Referrer": "https://bilumoi.com",
        "Accept-language": "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7,vi;q=0.6",
};

const AJAX_PLAYER_API = "https://bilumoi.com/ajax/player/";

export default class BiluTVMediaExtractor extends MediaExtractor {
    constructor(movieID, episodeID) {
        super(movieID, episodeID);
    }

    async extractMedias() {
        // parse the webpage source to extract movieID and episodeID
        let source = NUM_SOURCES;
        let medias = [];
        //iterate through each alternative media sources, and attempt to crawl video source
        while (source-- > 0) {
            try {
                //1st layer cache
                let mediaMetadata = await MediaMetadata.getMediaMetadata({
                    "movieID": this.movieID,
                    "episodeID": this.episodeID,
                    "sv": source
                });
                
                if(!mediaMetadata)
                    continue;

                if(mediaMetadata.type == "video-sources") {
                    let bundle = []
                    mediaMetadata.data.map(m => {
                        if(m["file"] != "error") 
                            bundle.push(MediaSource.createFrom(m))
                    });
                    if(bundle.length)
                         medias.push(bundle);
                } else if(mediaMetadata.type == "iframe") {
                    let iframeSrc = mediaMetadata.data;
                    //2nd layer cache
                    if(iframeSrc.includes("slug")) {
                        let urlObj = new URL(iframeSrc);
                        iframeSrc = genHydraxURL(urlObj.searchParams.get("slug"));
                        try {
                            let streamLinks = await simpleGetLinkDriver({
                                url: iframeSrc,
                                key: urlObj.searchParams.get("key"), 
                                origin: "https://bilumoi.com/"
                            });
                            if(streamLinks)
                                medias = medias.concat(streamLinks);
                        } catch (e) {
                            console.log("Error extracting hydrax \n" +e)
                        }
                    }
                    medias.push([new MediaSource(iframeSrc, "iframe")]);
                }
            } catch (e) {
                console.log(`Error: ${e}`);
            }
        }
        return medias;
    }
}