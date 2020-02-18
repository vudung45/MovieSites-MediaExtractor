import MediaExtractor from '../base/base_mediaextractor'
import request from 'async-request';
import { parse } from 'node-html-parser';
import MediaSource from '../../utils/mediasource.js'
import { Hydrax } from '../../stream_services/services.js'
import { getProp } from '../../utils/helper.js'
import MediaMetadata from './api/mediametadata.js'
import {simpleGetLinkDriver} from '../../stream_services/services.js';


/* 
 Problems:
    - Pretty simple schema. 
    - KhoaiTV enables cross-origins access and media source is eagerly loaded 
        so we don't have to do any workaround here
 Solution:
    - Parse the page source code for <iframe> tag
*/


const KHOAITV_BASE_PHIMURL = "http://khoaitv.org/phim/"
export class KhoaiTVMediaExtractor extends MediaExtractor {


    async _extractMedias(aux) {
        //1st layer cache
        let mediaMetadatas = await MediaMetadata.getMediaMetadata({
            "movieID": aux["movieID"],
            "episodeID": aux["episodeID"]
        });
        let medias = {"direct": [],
                      "iframe": []}
        
        if(!mediaMetadatas)
            return [];


        for(let mediaMetadata of mediaMetadatas) {
            if(mediaMetadata.type == "video-sources"){
                let bundle = []
                mediaMetadata.data.map(m => {
                    if(m["file"] != "error") 
                        bundle.push(MediaSource.createFrom(m))
                });
                medias["direct"].push(bundle); // direct video source
            }
            else if(mediaMetadata.type == "iframe") {
                let bundle = []
                let iframeSrc = mediaMetadata.data;
                //2nd layer cache
                let streamLinks = await simpleGetLinkDriver({
                    "url": iframeSrc
                });
                if(streamLinks)
                    medias[iframeSrc]  = streamLinks;

                medias["iframe"].push([new MediaSource(iframeSrc, "iframe")]);
            }
        }
        return medias;
    } 

}

module.exports = new KhoaiTVMediaExtractor();
