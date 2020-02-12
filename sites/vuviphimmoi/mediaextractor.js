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
        let medias = [];

        if(!mediaMetadata)
            return [];
        
        if(mediaMetadata.type == "video-sources"){
            let bundle = []
            mediaMetadata.data.map(m => {
                if(m["file"] != "error") 
                    bundle.push(MediaSource.createFrom(m))
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
            medias.push([new MediaSource(iframeSrc, "iframe")]);
        }
        return medias;
    }
}