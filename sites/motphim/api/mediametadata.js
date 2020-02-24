import SiteMediaMetadata from '../../base/api/base_mediametadata.js';
import aes from '../../../utils/aes.js';
import {
    AESConfig
} from '../config.js'
import request from 'request-promise';
import _request from 'request';
import crypto from './EHYME.js'
var btoa = require('btoa');

const FAKE_HEADERS = {
    "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    "User-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36",
    "Origin": "https://motphim.net",
    "Referer": "https://motphim.net/xem-phim/khu-rung-bi-mat-tap-1-7705_97558.html",
    "Accept-language": "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7,vi;q=0.6",
};


/* MOTPHIM APPROACHE TO ENCRYPT the CSRF lmao */
function jquery_beauty(A, epi, t) {
    let JQMP = require("./JQMP.js")
    var w = "document.referrer";
    var u = 500;
    var v = "motphim.net";
    var x = epi;
    var y = crypto.EHYME(w, x, {
        khoaCai: 4,
        itenay: u
    });
    var z = JQMP.TUAMADAM(t);
    return btoa(JQMP.AKHAMA.etulang(A, y, {
        imame: z
    }));
}

const MOTPHIM_BASE_URL = "https://motphim.net/xem-phim/p";
const MOTPHIM_API = "https://api.motphim.net/";
const MOTPHIM_CSRF_API = "https://dc.motphim.net/token";

class MotphimMediadata extends SiteMediaMetadata {

    constructor(cacheManager = null, cachePrefix = "MotphimMediadata") {
        super(cacheManager, cachePrefix, ["_parseMetadataFromSite", "_fetchApi"]);
    }

    async _parseMetadataFromSite(aux) {
        let metaData = null;

        try {
            // no cache
            let urlResp = await request({
                url: `${MOTPHIM_BASE_URL}-${aux["movieID"]}_${aux["episodeID"]}.html`,
                method: "GET",
                headers: FAKE_HEADERS
            });

            let dataLink = `${urlResp.match(/var dataLink *?= *?"(.*?)"/)[1]}`;
            let vId = `${urlResp.match(/var vId *?= *?"(.*?)"/)[1]}`;
            let slug = `${urlResp.match(/var slug *?= *?"(.*?)"/)[1]}`;
            let csrfToken = `${urlResp.match(/name="csrf-token" *content="(.*)">/)[1]}`
            metaData = {
                "dataLink": dataLink,
                "vId": vId,
                "slug": slug,
                "eId": aux["episodeID"],
                "filmId": aux["movieID"],
                "csrfToken": csrfToken
            }
        } catch (e) {
            console.log("MotphimMediadata._parseMetadataFromSite().\n" + e);
        }
        return metaData;
    }

    async _fetchApi(aux) {
        let apiResp = null;
        try {
            console.log("BYPASS MOTPHIM CSRF...")
            console.log(aux);
            let keygen = mkey = null;
            try {
                keygen =  jquery_beauty(aux.csrfToken, aux.eId, "dung-getlink-nua-ban-oi");
                mkey = btoa(btoa(btoa(aux.eId)));
            } catch (e) {
                console.log("Failed to decrypt: "+e);
                return null;
            }

            console.log({
                keygen: keygen,
                mkey: mkey,
            })

            let csrfRsp = await request({
                uri: MOTPHIM_CSRF_API,
                headers: {
                    ...FAKE_HEADERS
                },
                form: {
                    keygen: keygen,
                    mkey: mkey
                },
                method: "POST"
            });

            console.log("__cfduld from server: "+csrfRsp)

            // successfully bypassed..
            let cookie = request.cookie("__cfduld="+csrfRsp);
            apiResp = JSON.parse(await request({
                uri: MOTPHIM_API,
                headers: {
                    "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                    "User-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36",
                    "Origin": "https://motphim.net",
                    "Referer": `${MOTPHIM_BASE_URL}-${aux["filmId"]}_${aux["eId"]}.html`,
                    "Accept-language": "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7,vi;q=0.6",
                    "Cookie": cookie
                },
                body: `x_dataLink=${aux.dataLink}&x_eId=${aux.eId}&x_vId=${aux.vId}&x_slug=${aux.slug}`,
                method: "POST"
            }));
    
            if (!apiResp.status)
                throw "Invalid Resp.\n" + JSON.stringify(apiResp);
            
            console.log(apiResp);
            //apiResp["playlist"] is somtimes an array or a dict
            let toDecrypt = Array.isArray(apiResp["playlist"]) ? [apiResp["playlist"]] : 
                                                                Object.keys(apiResp["playlist"]).map( k => apiResp["playlist"][k]); 


            for (const item of toDecrypt) {
                if(Array.isArray(item)) {
                    item.forEach(f => {
                        try {
                            f.file = aes.dec(f.file, AESConfig.aesKey);
                        } catch (e) {
                            console.log("Failed to AES decrypt: " + f.file);
                        }
                    });
                } else {
                    if("file" in item) {
                        try {
                            item.file = aes.dec(item.file, AESConfig.aesKey);
                        } catch (e) {
                            console.log("Failed to AES decrypt: " + item.file);
                        }
                    }
                }
            }
            if (apiResp["mirror_link"]) {
                try {
                    apiResp["mirror_link"] = aes.dec(apiResp["mirror_link"], AESConfig.aesKey);
                    if (apiResp["mirror_link"].substring(0, 2) == "//")
                        apiResp["mirror_link"] = "https://" + apiResp["mirror_link"].substring(2);
                } catch (e) {
                    console.log("Failed to AES decrypt: " + apiResp["mirror_link"]);
                }
            }
        } catch (e) {
            console.log("Error in MotphimMediadata._fetchApi().\n" + e);
        }
        return apiResp;
    }

    async getMediaMetadata(aux) {

        //utilize cache
        let siteMetaData = await this._parseMetadataFromSite(aux);
        if (!siteMetaData)
            return null;

        //utilize cache
        let apiResp = await this._fetchApi(siteMetaData);

        if (!apiResp)
            return null;

        metadatas = []

        if (apiResp["mirror_link"])
            metadatas.push({
                "type": "iframe",
                "data": apiResp["mirror_link"]
            });

        if (apiResp["playlist"]) {
            if(!Array.isArray(apiResp["playlist"])) {
                for (const p of Object.keys(apiResp["playlist"])) {
                    if(Array.isArray(apiResp["playlist"][p])) {
                        metadatas.push({
                            "type": "video-sources",
                            "data": apiResp["playlist"][p]
                        });
                    }

                    if(p == "hls") {
                        metadatas.push({
                            "type": "video-sources",
                            "data": [{...apiResp["playlist"][p], type:"hls"}]
                        });
                    }
                }
            } else {
                metadatas.push({
                    "type": "video-sources",
                    "data": apiResp["playlist"]
                });
            }
        }

        return metadatas;
    }

}

module.exports = new MotphimMediadata();