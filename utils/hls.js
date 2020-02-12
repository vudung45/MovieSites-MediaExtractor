import request from 'async-request';
import {extractHostname, PasteBin, get_drive_link} from './helper.js'
import Promise from 'promise';
import atob from 'atob';


export async function gen_m3u8_smamuhh1metro(streamServer, data, driveLink=true, pasteutil=PasteBin){
    let txt = "#EXTM3U\n#EXT-X-VERSION:4\n#EXT-X-PLAYLIST-TYPE:VOD\n#EXT-X-TARGETDURATION:" + data['duration'] + "\n#EXT-X-MEDIA-SEQUENCE:0\n"

    if('hash' in data){
        txt += `#EXT-X-HASH:${data['hash']}\n`
        txt += `#EXT-X-KEY:METHOD=AES-128,URI=https://${streamServer}/hash/${data['sig']}?key=${data['hash']},IV=${data['iv']}\n`
    }

    let d = data['ranges'];
    let s = 0;
    let u = data['ids'];
    let jointAsync = [];
    data['ids'].forEach((id) => jointAsync.push(request(`https://${streamServer}/html/${data['sig']}/${data['id']}/${id}/0.html?domain=hydrax.net`, {
        "headers" :  {
                "Content-Type": "application/json",
                "Origin" : "https://hydrax.net",
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36'
        },
        "method": "GET"
    })));
    let jointAwait  = await Promise.all(jointAsync);
    let chunksUrls = [];
    jointAwait.forEach(m => chunksUrls.push(atob(JSON.parse(m.body)["url"])));
    for(let t = 0; t < d.length; ++t)
    {
        let f = chunksUrls[t];
        for(let p = 0; p < d[t].length; ++p)
        {
            txt += `#EXTINF:${data['extinfs'][s]},\n`
            txt += `#EXT-X-BYTERANGE:${d[t][p]}\n`
            txt += `${driveLink ? get_drive_link(f) : f}\n`
            s += 1 
        }
    }
    txt += "#EXT-X-ENDLIST";
    return await pasteutil.createPaste("",txt);
}


