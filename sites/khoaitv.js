import MediaExtractor from './base.js'
import request from 'async-request';
import { parse } from 'node-html-parser';
import MediaSource from '../utils/mediasource.js'
import { Hydrax } from '../stream_services/services.js'
import { getProp } from '../utils/helper.js'

/* 
 Problems:
    - Pretty simple schema. 
    - KhoaiTV enables cross-origins access and media source is eagerly loaded 
        so we don't have to do any workaround here
 Solution:
    - Parse the page source code for <iframe> tag
*/



export default class KhoaiTVMediaExtractor extends MediaExtractor
{
    constructor(movieID, episodeID) {
        //http://khoaitv.org/phim/dreaming-back-to-the-qing-dynasty-mong-hoi-dai-thanh-13422-tap-1
        super(movieID, episodeID);
    }

    async extractMedias() {
        let medias = [];
        let urlResp = await request(this.url);
        let html_parser = parse(urlResp.body);
        // get iframe url
        let iframeURL = html_parser.querySelector("iframe").rawAttrs.match(/src="(.*?)"/g)[0].replace('src="','').replace('"','');
        // now parse the iframe page
        urlResp = (await request(iframeURL));
        // parse content between .setup({.*}) in the new page
        let jwPlayerSetupContent = urlResp.body.match(/\.setup\({(.*?)}\)/)[0].replace(/\.setup\(( *)/,'');
        jwPlayerSetupContent = jwPlayerSetupContent.slice(0, jwPlayerSetupContent.length - 1);
        let jwSettings = {}
        try {
            eval(`jwSettings = ${jwPlayerSetupContent}`);
        } catch (e) {
            console.log(e);
        }
        // check to see whether jwPlayer has video source or not
        if(typeof jwSettings.file != 'undefined' && jwSettings.file != "blank")
            medias.push([new MediaSource(urlResp, jwSettings.type, jwSettings.label).getJson()]);

        try {
            // if no video source, then we'd have to go with the iframe path
            let iframeSrc = urlResp.body.match(/iframe src="(.*?)"/)[0].replace('iframe src="','').replace('"','');
            // the iframe might be targeting to hydrax check to see if we can extract anything
            if(iframeSrc.includes("hydrax.net")) {
                let sources = await Hydrax.getMediaSource(
                    {
                       "slug": iframeSrc.split("watch?v=")[1],
                       "origin": iframeURL}
                    );  
                if(sources && sources.length > 0) {
                    sources.map(m => {
                        medias.push(m);

                    })
                }
            }
            medias.push([new MediaSource(iframeSrc, "iframe").getJson()]);
        } catch(e) {
            console.log(e);
        }
        return medias;
    } 

}
