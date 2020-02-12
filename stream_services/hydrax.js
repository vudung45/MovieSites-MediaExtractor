import StreamingService from './base.js';
import {gen_m3u8_smamuhh1metro} from '../utils/hls.js';
import path from 'path';
import MediaSource from '../utils/mediasource.js';

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
        super(cacheManager, "Hydrax");
    }

    async _getProxy(){
        return null;
    }

    async _gen_m3u8_smamuhh1metro(aux, mediaType, streamServer, data) {
        let m3u8Link = null;

        //load from cache
        if(this.cacheManager != null)
            m3u8Link = await this.cacheManager.load(JSON.stringify(aux)+`${mediaType}_${streamServer}`);

        if(m3u8Link)
            return m3u8Link;

        try {
            m3u8Link = await gen_m3u8_smamuhh1metro(streamServer, data);
        } catch (e) {
            console.log(e)
        }

        // cache it so that we don't have to request again next time
        if(m3u8Link && this.cacheManager)
            this.cacheManager.update(JSON.stringify(aux)+`${mediaType}_${streamServer}`, m3u8Link);

        return m3u8Link;
    }

    async getMediaSource(aux) {
        let hydaxApiResp = null;

        if(this.cacheManager != null)
            hydaxApiResp = await this.cacheManager.load(JSON.stringify(aux));
        
        if(hydaxApiResp == null) {
            try {
                if("key" in aux && aux["key"])  // use vip API
                    hydaxApiResp = await getVipHydraxResp(aux["slug"], aux["key"], aux["origin"], await this._getProxy(), "includeOrigin" in aux ? aux["includeOrigin"] : false);
                else  //use guest API
                    hydaxApiResp = await getGuestHydraxResp(aux["slug"], null, aux["origin"], await this._getProxy(), "includeOrigin" in aux ? aux["includeOrigin"] : false);
            } catch(e) {
                return [];
            }
        }
        if(hydaxApiResp && this.cacheManager && hydaxApiResp.status != false)
            this.cacheManager.update(JSON.stringify(aux), hydaxApiResp);

        let medias = [];
        //process api response to genenerate m3u8 files
        if("ping" in hydaxApiResp && hydaxApiResp["ping"].includes("smamuhh1metro")) {
            let url = null;
            const keys = Object.keys(hydaxApiResp);
            for(const key of keys){
                if(HYDRAX_SUPPORTED_MEDIA.has(key)) 
                    medias.push(new MediaSource(await this._gen_m3u8_smamuhh1metro(aux, key, hydaxApiResp["servers"]["stream"], hydaxApiResp[key]), "m3u8", key));
            }
        } 
        return medias;
    }
}

module.exports = new Hydrax();