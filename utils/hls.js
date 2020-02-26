import request from 'request-promise';
import {
    extractHostname,
    LocalPaste,
    get_drive_link,
    normalize_url,
    getRedirectLink
} from './helper.js'
import Promise from 'promise';
import atob from 'atob';
import urljoin from "url-join";
import fs from "fs";


export async function gen_m3u8_smamuhh1metro(streamServer, data, driveLink = true, pasteutil = LocalPaste) {
    try {
        let txt = "#EXTM3U\n#EXT-X-VERSION:4\n#EXT-X-PLAYLIST-TYPE:VOD\n#EXT-X-TARGETDURATION:" + data['duration'] + "\n#EXT-X-MEDIA-SEQUENCE:0\n"

        if ('hash' in data) {
            txt += `#EXT-X-HASH:${data['hash']}\n`
            txt += `#EXT-X-KEY:METHOD=AES-128,URI=https://${streamServer}/hash/${data['sig']}?key=${data['hash']},IV=${data['iv']}\n`
        }

        let d = data['ranges'];
        let s = 0;
        let u = data['ids'];
        let jointAsync = data['ids'].map((id) => request({
            "uri": `https://${streamServer}/html/${data['sig']}/${data['id']}/${id}/0.html?domain=playhydrax.com`,
            "headers": {
                "Content-Type": "application/json",
                "Origin": "https://hydrax.net/",
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36'
            },
            "method": "GET"
        }));
        let jointAwait = await Promise.all(jointAsync);
        let chunksUrls = [];
        jointAwait.forEach(m => {
            //console.log(m);
            if (!(m && "url" in JSON.parse(m))) {
                throw "Something went wrong wile generating m3u8 file for hydrax";
            }
            chunksUrls.push(atob(JSON.parse(m)["url"]))
        });

        for (let t = 0; t < d.length; ++t) {
            let f = chunksUrls[t];
            for (let p = 0; p < d[t].length; ++p) {
                txt += `#EXTINF:${data['extinfs'][s]},\n`
                txt += `#EXT-X-BYTERANGE:${d[t][p]}\n`
                let link = driveLink ? get_drive_link(f) : f;

                if (!link)
                    throw "Failed to chunk url (convert to drinkLink: " + driveLink + "): " + f;

                txt += `${driveLink ? get_drive_link(f) : f}\n`
                s += 1
            }
        }
        txt += "#EXT-X-ENDLIST";
        return await pasteutil.createPaste("", txt);
    } catch (e) {
        console.log(e);
        console.log("Error generating m3u8 gen_m3u8_smamuhh1metro()");
    }
    return null;
}


export async function gen_m3u8(m3u8Content, origin, redirectLink = true, pasteutil = LocalPaste) {
    let content = m3u8Content;
    // fs.writeFile("./paste/save.m3u8", m3u8Content, (err) => {console.log(err)});
    // console.log(content);
    try {
        let regx = new RegExp("#EXTINF:.*?,(?:\n#EXT-X-BYTERANGE:.*?)?(?: |\n)+(.*?)(?: |\n)+", "g");
        let myArray;
        let urlsMatches = [];
        while ((myArray = regx.exec(m3u8Content)) !== null) {
            urlsMatches.push(myArray);
        }
        let urls = urlsMatches.map(m => m[1]);
        if (urls.length) {
            for (let i = 0; i < urls.length; ++i) {
                if (urls[i].substring(0, 2) != "//" && urls[i].substring(0, 4) != "http") {
                    if (urls[i].charAt(0) == "/") {
                        content = content.replace(urls[i], urljoin(extractHostname(origin), urls[i]));
                        urls[i] = urljoin(extractHostname(origin), urls[i]);
                    } else {
                        let parentPath = origin.split("/");
                        parentPath.pop();
                        content = content.replace(urls[i], urljoin(parentPath.join("/"), urls[i]));
                        urls[i] = urljoin(parentPath.join("/"), urls[i]);
                    }
                }
            }
            if (redirectLink) {
                let asyncTasks = []
                urls.forEach(u => asyncTasks.push(getRedirectLink({
                    uri: u
                })));
                console.log(urls);
                let realUrls = await Promise.all(asyncTasks);
                console.log(realUrls);
                for (let i = 0; i < realUrls.length; ++i)
                    content = content.replace(urls[i], realUrls[i]);

            }
        }
        return pasteutil.createPaste("", content);
    } catch (e) {
        console.log(e);
    }

    return null;
}