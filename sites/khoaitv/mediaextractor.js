import MediaExtractor from '../base/base_mediaextractor'
import request from 'async-request';
import { parse } from 'node-html-parser';
import MediaSource from '../../utils/mediasource.js'
import { Hydrax } from '../../stream_services/services.js'
import { getProp } from '../../utils/helper.js'
import Media from './api/getmedia.js'

/* 
 Problems:
    - Pretty simple schema. 
    - KhoaiTV enables cross-origins access and media source is eagerly loaded 
        so we don't have to do any workaround here
 Solution:
    - Parse the page source code for <iframe> tag
*/


const KHOAITV_BASE_PHIMURL = "http://khoaitv.org/phim/"
export default class KhoaiTVMediaExtractor extends MediaExtractor
{
    constructor(movieID, episodeID) {
        //http://khoaitv.org/phim/dreaming-back-to-the-qing-dynasty-mong-hoi-dai-thanh-13422-tap-1
        super(movieID, episodeID);
    }

    async extractMedias() {
        let medias = [];
        let response = await Media.getMediaMetadata({
            "movieID": this.movieID,
            "episodeID": this.episodeID
        });

        if(!response)
            return medias;

        if(response.type == "video-sources")
            medias.push([new MediaSource(response.data["file"], response.data["type"], response.data["label"]).getJson()]);
        else if(response.type == "iframe") {
            let iframeSrc = response.data;
            if(iframeSrc.includes("hydrax.net")) {
                try {
                    let sources = await Hydrax.getMediaSource(
                        {
                           "slug": iframeSrc.split("watch?v=")[1],
                           "origin": iframeSrc}
                        );  
                    if(sources && sources.length > 0) {
                        sources.map(m => {
                            medias.push(m);

                        });
                    }   
                } catch (e) {
                    console.log("Error getting hydrax video-source: \n"+e);
                    medias.push([new MediaSource(iframeSrc, "iframe").getJson()]);
                }
            } else {
                medias.push([new MediaSource(iframeSrc, "iframe").getJson()]);
            }
        }
        return medias;
    } 

}
