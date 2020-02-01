import request from 'async-request';
import extractHostname from './helper.js'
import MediaSource from './mediasource.js'

const HYDRAX_SUPPORTED_MEDIA =  new Set(['fullhd', 'hd', 'mhd', 'sd', 'origin']);
const HYDRAX_VIP_API = "https://multi.hydrax.net/vip"
const HYDRAX_GUEST_API = "https://multi.hydrax.net/guest"


function get_m3u8_smamuhh1metro(server, media, origin, includeOrigin=false){
    let m3u8Src = `${server}/${"sig" in media ? media.sig : 0}/0/playlist.m3u8`;
    if(includeOrigin) {
        let _headers = {
            'Origin': origin,
            'User-Agent': "Chrome/59.0.3071.115 Safari/537.36",
            'Referer': origin
        }
        m3u8Src += `|${encodeURI(_headers)}`;
    }
    return m3u8Src;
}


async function getHLSHydrax(api, hydrax_slug, hydrax_key=null, origin, proxy=null, includeOrigin=false)
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
    let medias = [];
    if("ping" in apiResponse && apiResponse["ping"].includes("smamuhh1metro")) {
        let server = apiResponse["ping"];
        Object.keys(apiResponse).map(key => {
            if(HYDRAX_SUPPORTED_MEDIA.has(key)) 
                medias.push(new MediaSource(get_m3u8_smamuhh1metro(server, apiResponse[key], origin, includeOrigin), "hls5", key).getJson());
        })

    } else {
        throw `Error retrieving hydrax media source (slug: ${hydrax_slug}, key: ${hydrax_key}). Api Resp: ${JSON.stringify(apiResponse)}`
    }
    return medias;
}

export async function getVipHLSHydrax(hydrax_slug, hydrax_key, origin, proxy=null, includeOrigin=false) {
    return await getHLSHydrax(HYDRAX_VIP_API, hydrax_slug, hydrax_key, origin, proxy, includeOrigin);
}

export async function getGuestHLSHydrax(hydrax_slug, hydrax_key, origin, proxy=null, includeOrigin=false) {
    return await getHLSHydrax(HYDRAX_GUEST_API, hydrax_slug, hydrax_key, origin, proxy, includeOrigin);
}
