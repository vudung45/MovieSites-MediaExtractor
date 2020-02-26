import MediaExtractor from '../base/base_mediaextractor.js'
import request from 'request-promise';
import {
    parse
} from 'node-html-parser';
import MediaSource from '../../utils/mediasource.js';
import fs from 'fs';
import {
    simpleGetLinkDriver
} from '../../stream_services/services.js'
import MediaMetadata from './api/mediametadata.js';
import {
    genHydraxURL
} from '../../utils/helper.js';
/* 
 Problems:
    - /ajax/player blocks cors
 Solution:
    - Modify Origin in request's headers
*/

const NUM_SOURCES = 4; // number of alternative movie sources
const FAKE_HEADERS = {
    "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    "User-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36",
    "Origin": "https://bilutv.org",
    "Referrer": "https://bilutv.org",
    "Accept-language": "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7,vi;q=0.6",
};

const AJAX_PLAYER_API = "https://bilutv.org/ajax/player/";

export class BiluTVMediaExtractor extends MediaExtractor {

    constructor(prefix="BiluTV") {
        super(prefix);
    }

    async _extractMedias(aux) {

        // parse the webpage source to extract movieID and episodeID
        let source = NUM_SOURCES;
        let medias = {
            "direct": [],
            "iframe": []
        }
        //iterate through each alternative media sources, and attempt to crawl video source
        while (source-- > 0) {
            try {
                //1st layer cache
                let mediaMetadatas = await MediaMetadata.getMediaMetadata({
                    "movieID": aux["movieID"],
                    "episodeID": aux["episodeID"],
                    "sv": source
                });

                if (!mediaMetadatas)
                    continue;

                for (let mediaMetadata of mediaMetadatas) {
                    let bundle = []
                    if (mediaMetadata.type == "video-sources") {
                        mediaMetadata.data.map(m => {
                            if (m["file"] != "error")
                                bundle.push(MediaSource.createFrom(m))
                        });
                        if (bundle.length)
                            medias["direct"].push(bundle);
                    } else if (mediaMetadata.type == "iframe") {
                        let iframeSrc = mediaMetadata.data;
                        //2nd layer cache
                        if (iframeSrc.includes("slug")) {
                            let urlObj = new URL(iframeSrc);
                            iframeSrc = genHydraxURL(urlObj.searchParams.get("slug"));
                            try {
                                let streamLinks = await simpleGetLinkDriver({
                                    url: iframeSrc,
                                    key: urlObj.searchParams.has("key") ? urlObj.searchParams.get("key") : null,
                                    origin: "https://bilutv.org/"
                                });
                                if (streamLinks)
                                    medias[iframeSrc] = streamLinks;

                            } catch (e) {
                                console.log("Error extracting hydrax \n" + e)
                            }
                        }

                        medias["iframe"].push([new MediaSource(iframeSrc, "iframe")]);
                    }
                }
            } catch (e) {
                console.log(`Error: ${e}`);
            }
        }
        return medias;
    }
}
module.exports = new BiluTVMediaExtractor();