import MediaExtractor from '../base/base_mediaextractor.js'
import request from 'async-request';
import {
    parse
} from 'node-html-parser';
import MediaSource from '../../utils/mediasource.js';
import MediaMetadata from './api/mediametadata.js';
import {simpleGetLinkDriver} from '../../stream_services/services.js';
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

const BASE_URL = "https://vuviphimmoi.com/xem-phim";


export default class VuViPhimMoi extends MediaExtractor {
    constructor(movieID, episodeID) {
        super(movieID, episodeID);
    }

    async extractMedias() {
        //1st layer cache
        let mediaMetadata = await MediaMetadata.getMediaMetadata({
            "movieID": this.movieID,
            "episodeID": this.episodeID
        });
        let medias = []
        if(mediaMetadata.type == "video-sources"){
            let bundle = []
            mediaMetadata.data.map(m => {
                if(m["file"] != "error") 
                    bundle.push(MediaSource.createFrom(m).getJson())
            });
            if(bundle.length)
                medias.push(bundle);
        }
        else if(mediaMetadata.type == "iframe") {
            let iframeSrc = mediaMetadata.data;
            //2nd layer cache
            let streamLinks = await simpleGetLinkDriver({
                "url": iframeSrc
            });
            if(streamLinks)
                medias = medias.concat(streamLinks);
            medias.push([new MediaSource(iframeSrc, "iframe").getJson()]);
        }
        return medias;
    }
}