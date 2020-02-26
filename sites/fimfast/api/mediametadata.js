import SiteMediaMetadata from '../../base/api/base_mediametadata.js';
import request from 'request-promise';
const uuidv1 = require('uuid/v1');

const FAKE_HEADERS = {
    "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    "User-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36",
    "Origin": "https://fimfast.com",
    "Referrer": "https://fimfast.com",
    "Accept-language": "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7,vi;q=0.6",
};


//https://fimfast.com/tho-san-quai-vat/tap-3-mat-trang-phan-phuc
const FIMFAST_BASE_URL = {
    "format": (movieName, episode) => `https://fimfast.com/${movieName}${episode ? "/tap-"+episode : ""}`
}
//https://fimfast.com/api/v2/films/17651/episodes/254469
const FIMFAST_API = {
    "format": (movieID, episodeID) => `https://fimfast.com/api/v2/films/${movieID}/episodes/${episodeID}`
}

function encodeString(e, t = 69) {
    var a = "";
    e.toString();
    for (var i = 0; i < e.length; i++) {
        var r = e.charCodeAt(i),
            n = r ^ t;
        a += String.fromCharCode(n)
    }
    return a;
}

class FimFastMetadata extends SiteMediaMetadata {

    constructor(cacheManager = null, cachePrefix = "FimFastMetadata") {
        super(cacheManager, cachePrefix, ["_parseMetadata", "getMediaMetadata", "_fetchApi"]);
    }

    async _parseMetadata(aux) {
        console.log(FIMFAST_BASE_URL.format(aux["movieName"], aux["episode"]));
        let urlResp = await request({
            "uri": FIMFAST_BASE_URL.format(aux["movieName"], aux["episode"]),
            "headers": FAKE_HEADERS
        });

        return {
            "movieID": urlResp.match(/data-id="(\d*?)"/)[1],
            "episodeID": urlResp.match(/episode-id="(\d*?)"/)[1]
        }
    }

    async _fetchApi(aux) {
        let fakeCookies = uuidv1().replace(/-/g, "");
        console.log("__cfduid=" + fakeCookies)
        let urlResp = await request({
            "uri": FIMFAST_API.format(aux["movieID"], aux["episodeID"]),
            "headers": {
                "X-Requested-With": "XMLHttpRequest",
                "Content-Type": "application/json",
                "Origin": "https://fimfast.com",
                "Referer": aux["url"],
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.116 Safari/537.36",
                "Cookie": request.cookie("__cfduid=" + fakeCookies)
            },
        });

        let jsonResp = JSON.parse(urlResp);
        if (jsonResp.sources)
            return jsonResp;

        return null;
    }

    async getMediaMetadata(aux) {
        /* 
         @param 
                aux     {
                            "moveName"  : ...,
                            "episode": ...
                        }
         @return
                        [{
                            "type": ..., // video-sources, iframe
                            "data" ...
                        }...]
        */
        let metadatas = [];
        try {
            let siteMetadata = await this._parseMetadata(aux);
            console.log(siteMetadata);
            let jsonResp = await this._fetchApi({
                ...siteMetadata,
                url: FIMFAST_BASE_URL.format(aux["movieName"], aux["episode"])
            });
            if (!jsonResp)
                return null;

            let sources = jsonResp.sources;
            let mp4Sources = [];
            let hlsSources = [];
            Object.keys(sources).map(server => {
                if (!sources[server])
                    return;
                if (Array.isArray(sources[server]) && sources[server].length) {
                    console.log(sources[server][0]);
                    if (sources[server][0].type == "video/mp4") {
                        mp4Sources.push({
                            type: "video-sources",
                            data: sources[server]
                        })
                    }
                } else if (server == "hls" || server === "hrx") {
                    sources[server] = encodeString(sources[server]);
                    hlsSources.push({
                        type: "video-sources",
                        data: [{
                            src: sources[server],
                            label: "VIDEO",
                            type: "hls"
                        }]
                    });
                }
            });
            metadatas = mp4Sources.concat(hlsSources);
        } catch (e) {
            console.log(e);
        }
        return metadatas.length ? metadatas : null;
    }

}

module.exports = new FimFastMetadata();