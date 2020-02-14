import StreamingService from './base.js';
import aes from '../utils/aes.js';
import path from 'path';
import MediaSource from '../utils/mediasource.js';
import {gen_m3u8} from '../utils/hls.js';
import {extractHostName} from '../utils/helper.js';
import fetch from 'node-fetch';



/* motphim has its own streaming service (i think) 
  located at motphim.net/player */

const FAKE_HEADERS = {
        "Content-type" : "application/x-www-form-urlencoded; charset=UTF-8",
        "User-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36",
        "Origin": "https://motphim.net",
        "Accept-language": "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7,vi;q=0.6",
};

const AESKEY = "motphim.net45904818772018";

const API = "https://iapi.motphim.org/cloud/"
class MotphimStream extends StreamingService {
    constructor(cacheManager=null) {
        super(cacheManager, "Hydrax", ["_getApiResp", "_gen_m3u8"]);
    }


    async _gen_m3u8(aux){
        let pasteLink = null;
        let pasteContent = await fetch(aux["src"], {
            "headers": FAKE_HEADERS
        }).then(r => r.text());
        
        try {
            pasteLink = await gen_m3u8(pasteContent,"https://motphim.org");
        } catch (e) {
            console.log(e);
        }
        return pasteLink;

    }

  
    async _getApiResp(aux){
        let apiResp = await fetch(API, {
            "headers": FAKE_HEADERS,
            "method": "POST",
            "body": "d="+aux["d"]
        }).then(r => r.json()).catch(e => {
            console.log(e);
            return e;
        });

        if("d" in apiResp) {
            try {
                apiResp["d"] = aes.dec(apiResp["d"], AESKEY);
            } catch (e) {
                console.log("Failed to AES decrypt: "+apiResp["d"]);
            }
            return apiResp;
        }

        return null;

    }

    async getMediaSource(aux) {
        let medias = []
        let apiResp = await this._getApiResp(aux);
        let m3u8Paste = await this._gen_m3u8({
            "src": apiResp["d"],
            "cacheKey": aux["d"] // cache based on unique "d" metadata
        });
        if(!m3u8Paste)
            m3u8Paste = apiResp["d"]; // if fails to get paste, then just use the provided
        medias.push(new MediaSource(m3u8Paste, "hls", null));
        return medias;
    }
}

module.exports = new MotphimStream();