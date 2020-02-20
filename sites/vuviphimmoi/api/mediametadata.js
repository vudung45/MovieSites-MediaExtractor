import SiteMediaMetadata from '../../base/api/base_mediametadata.js';
import {
    unpackJS
} from '../../../utils/helper.js';
import request from 'async-request';
import {
    parse
} from 'node-html-parser';


const FAKE_HEADERS = {
    "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    "User-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36",
    "Origin": "https://vuviphimmoi.com",
    "Referer": "https://vuviphimmoi.com/",
    "Accept-language": "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7,vi;q=0.6",
};


const BASE_URL = "https://vuviphimmoi.com/xem-phim";

class VuViPhimmoiMetadata extends SiteMediaMetadata {

    constructor(cacheManager = null, cachePrefix = "VuViPhimmoiMetadata") {
        super(cacheManager, cachePrefix);
    }

    async getMediaMetadata(aux) {
        /* 
         @param 
                aux     {
                            "movieID"  : ...,
                            "episodeID": ...
                        }
         @return
                        {
                            "type": ..., // video-sources, iframe
                            "data" ...
                        }
        */
        let url = `${BASE_URL}-${aux["movieID"]}-${aux["episodeID"]}`;
        try {
            let urlResp = await request(url);
            let htmlParser = parse(urlResp.body);
            // first attemp to parse direct video sources in this webpage
            // if we can't, then the video sources are probably embedded through iframe
            let directVideoSrcs = null;
            try {
                let sourcesRegex = urlResp.body.match(/(eval\(function\(p,a,c,k,e,d\).*?)\s+?<\/script>/);
                let sources = null;
                if (sourcesRegex.length) {
                    sources = sourcesRegex[1];
                    sources = unpackJS(sources);
                } else {
                    sources = urlResp.body;
                }

                sourcesRegex = sources.match(/sources:\s?(\[.*?\]),/);
                if (sourcesRegex.length) {
                    sources = sourcesRegex[1].replace(/(?<={|,)([a-zA-Z][a-zA-Z0-9]*)(?=:)'/, "");

                    eval(`directVideoSrcs = ${sources}`);
                }
            } catch (e) {
                console.log(`${url} doesn't have direct video sources... try extracting iframe instead. \n ${e}`);
            }

            if (directVideoSrcs) {
                return [{
                    "type": "video-sources",
                    "data": directVideoSrcs
                }]
            }

            //try extracting through iframe instead
            let iframeAttrs = htmlParser.querySelector("#media").querySelector("iframe");
            if (typeof iframeAttrs != "undefinied") {
                let iframeURL = /src="(.*?)"/g.exec(iframeAttrs)[1];
                return [{
                    "type": "iframe",
                    "data": iframeURL
                }]
            }
        } catch (e) {
            console.log(e);
        }
        return null;
    }

}

module.exports = new VuViPhimmoiMetadata();