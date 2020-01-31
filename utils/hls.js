import request from 'async-request';
import extractHostname from './helper.js'

const HYDRAX_SUPPORTED_MEDIA =  new Set(['fullhd', 'hd', 'mhd', 'sd', 'origin']);
const HYDRAX_VIP_API = "https://multi.hydrax.net/vip"


export async function getVipHLSHydrax(hydrax_slug, hydrax_key, origin, proxy=null, includeOrigin=false) {
    let headers = {
        'Referer': origin,
        'Origin': origin,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36'
    };

    let data = {
        'key': hydrax_key,
        'type': 'slug',
        'value': hydrax_slug
    };
    // POST to hyrax API
    let apiResponse = JSON.parse((await request(HYDRAX_VIP_API, {
        "headers": headers, 
        "data": data,
        "method": "POST",
        "proxy": proxy // possible IP ban
    })).body);
    let medias = [];
    if("ping" in apiResponse && apiResponse["ping"].includes("smamuhh1metro")) {
        let server = apiResponse["ping"];
        Object.keys(apiResponse).map(key => {
            if(HYDRAX_SUPPORTED_MEDIA.has(key)) {
                let m3u8Src = `${server}/${"sig" in apiResponse[key] ? apiResponse[key].sig : 0}/0/playlist.m3u8`;
                console.log
                if(includeOrigin) {
                    let _headers = {
                        'Origin': origin,
                        'User-Agent': "Chrome/59.0.3071.115 Safari/537.36",
                        'Referer': origin
                    }
                    m3u8Src += `|${encodeURI(_headers)}`;

                }
                medias.push({"label": key, "src": m3u8Src, "type": "hls5"});
            }
        })

    } else {
        throw "not supported yet";
    }
    return medias;
}