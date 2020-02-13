import StreamingService from './base.js';
import {gen_m3u8_smamuhh1metro} from '../utils/hls.js';
import path from 'path';
import MediaSource from '../utils/mediasource.js';
import request from 'async-request';

const HYDRAX_VIP_API = "https://multi.hydrax.net/vip";
const HYDRAX_GUEST_API = "https://multi.hydrax.net/guest";
const HYDRAX_SUPPORTED_MEDIA =  new Set(['fullhd', 'hd', 'mhd', 'sd', 'origin']);

async function getHydraxResp(api, hydrax_slug, hydrax_key=null, origin, proxy=null, includeOrigin=false)
{
    let headers = {
        'Referer': origin,
        'Origin': origin,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36'
    };

    let data = {}
    if(hydrax_key) {
        data = {
            'key': hydrax_key,
            'type': 'slug',
            'value': hydrax_slug
        };
    } else {
        data = {
            'slug': hydrax_slug,
        };
    }

    // POST to hyrax API
    let apiResponse = JSON.parse((await request(api, {
        "headers": headers, 
        "data": data,
        "method": "POST",
        "proxy": proxy // possible IP ban
    })).body);
 
    return apiResponse;
}

async function getVipHydraxResp(hydrax_slug, hydrax_key, origin, proxy=null, includeOrigin=false) {
    return await getHydraxResp(HYDRAX_VIP_API, hydrax_slug, hydrax_key, origin, proxy, includeOrigin);
}

async function getGuestHydraxResp(hydrax_slug, hydrax_key, origin, proxy=null, includeOrigin=false) {
    return await getHydraxResp(HYDRAX_GUEST_API, hydrax_slug, hydrax_key, origin, proxy, includeOrigin);
}

class Hydrax extends StreamingService {
    constructor(cacheManager=null) {
        super(cacheManager, "Hydrax", ["_getHydraxApiResp", "_gen_m3u8_smamuhh1metro"]);
    }

    async _getProxy(){
        return null;
    }

    async _gen_m3u8_smamuhh1metro(aux) {
        let m3u8Link = null;
        try {
            m3u8Link = await gen_m3u8_smamuhh1metro(aux["streamServer"], aux["data"]);
        } catch (e) {
            console.log(e)
        }

        return m3u8Link;
    }

    async _getHydraxApiResp(aux) {
        let hydaxApiResp = null;
        try {
            if("key" in aux && aux["key"])  // use vip API
                hydaxApiResp = await getVipHydraxResp(aux["slug"], aux["key"], aux["origin"], await this._getProxy(), "includeOrigin" in aux ? aux["includeOrigin"] : false);
            else  //use guest API
                hydaxApiResp = await getGuestHydraxResp(aux["slug"], null, aux["origin"], await this._getProxy(), "includeOrigin" in aux ? aux["includeOrigin"] : false);
        } catch(e) {
            console.log(e);
            return null;
        }
        return hydaxApiResp;

    }

    async getMediaSource(aux) {
        let params = {
            "cacheKey" : JSON.stringify(aux)+"_getHydraxApiResp",
            ...aux
        };
        let hydaxApiResp = await this._getHydraxApiResp({
            cacheKey : JSON.stringify(aux)+"_getHydraxApiResp",...aux
        });

        if(!hydaxApiResp)  
            return null;

        let medias = [];
        //process api response to genenerate m3u8 files
        if("ping" in hydaxApiResp && hydaxApiResp["ping"].includes("smamuhh1metro")) { //schema for smauhh1metro
            let url = null;
            const keys = Object.keys(hydaxApiResp);
            for(const mediaType of keys){
                // cache layer for m3u8 file
                if(HYDRAX_SUPPORTED_MEDIA.has(key)) 
                    medias.push(new MediaSource(await this._gen_m3u8_smamuhh1metro({
                        streamServer: hydaxApiResp["servers"]["stream"], 
                        data: hydaxApiResp[key],
                        cacheKey : JSON.stringify(aux)+`${mediaType}_${hydaxApiResp["servers"]["stream"]}`
                    }), "m3u8", key));
            }
        } 
        return medias.length ? medias : null;
    }
}

module.exports = new Hydrax();