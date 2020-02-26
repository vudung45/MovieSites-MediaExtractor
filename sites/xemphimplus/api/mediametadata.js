import SiteMediaMetadata from '../../base/api/base_mediametadata.js';
import request from 'request-promise';


const AJAX_PLAYER_API = "https://bilutv.org/ajax/player/";
const FAKE_HEADERS = {
    "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    "User-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36",
    "Origin": "http://xemphimplus.net",
    "Referrer": "http://xemphimplus.net",
    "Accept-language": "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7,vi;q=0.6",
};


const XEMPHIMPLUSE_BASE_URL = "http://xemphimplus.net/xem-phim"
class XemPhimPlusMetadata extends SiteMediaMetadata {

    constructor(cacheManager = null, cachePrefix = "XemPhimPlusMetadata") {
        super(cacheManager, cachePrefix, ["_parseMetadata", "getMediaMetadata", "_fetchApi"]);
    }

    async _parseMetadata(aux) {
        console.log(`${XEMPHIMPLUSE_BASE_URL}-${aux["movieID"]}/${aux["episodeID"]}-sv${aux["svID"]}.html`);
        let urlResp = await request({
            "uri": `${XEMPHIMPLUSE_BASE_URL}-${aux["movieID"]}/${aux["episodeID"]}-sv${aux["svID"]}.html`,
            "headers": FAKE_HEADERS
        });

        let halim_cfg = JSON.parse(urlResp.match(/<script>.*var halim_cfg += +({.*}?)<\/script>/)[1]);
        console.log(halim_cfg);
        return {
            "player_url": halim_cfg.player_url,
            "episode_slug": halim_cfg.episode_slug,
            "server": halim_cfg.server,
            "subsv_id": halim_cfg.subsv_id,
            "post_id": halim_cfg.post_id,
            "nonce": urlResp.match(/data-nonce="(.*)?"/)[1],
            "csrfToken": urlResp.match(/name="csrf-token" +content="(.*)?"/)[1],
            "_": 1589562368111
        }
    }

    async _fetchApi(aux) {
        let playerUrl = aux.player_url;
        let csrfToken = aux.csrfToken;
        delete aux["player_url"];
        delete aux["csrfToken"];
        let urlParams = Object.keys(aux).map(function(k) {
            return encodeURIComponent(k) + '=' + (aux[k] ? encodeURIComponent(aux[k]) : "")
        }).join('&')
        console.log(urlParams)
        let resp = JSON.parse(await request({
            "uri": `${playerUrl}?${urlParams}`,
            "headers": {
                ...FAKE_HEADERS,
                "X-HALIM-PLAYER": true,
                "X-CSRF-TOKEN": csrfToken
            }
        }))
        console.log(resp);
        if (resp.data.status && resp.data.sources)
            return resp.data;
        return null;
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
        let metadatas = [];
        try {
            let siteMetadata = await this._parseMetadata(aux);
            console.log(siteMetadata);
            let apiResp = await this._fetchApi(siteMetadata);
            if (!apiResp)
                return null;

            if (!apiResp["ok"]) {
                let sources = apiResp["sources"];
                if (sources.includes("iframe")) {
                    metadatas.push({
                        type: "iframe",
                        data: sources.match(/<iframe.*?src="(.*?)".*<\/iframe>/)[1]
                    });
                }
            } else {
                let sources = JSON.parse(apiResp.ok);
                let hlsFiles = [];
                let mp4Files = []
                sources.forEach(s => {
                    if (s.type === "hls")
                        hlsFiles.push(s);
                    else
                        mp4Files.push(s);
                });
                if (hlsFiles.length) {
                    metadatas.push({
                        type: "video-sources",
                        data: hlsFiles
                    })
                }

                if (mp4Files.length) {
                    metadatas.push({
                        type: "video-sources",
                        data: mp4Files
                    })
                }
            }
        } catch (e) {
            console.log(e);
        }
        return metadatas.length ? metadatas : null;
    }

}

module.exports = new XemPhimPlusMetadata();