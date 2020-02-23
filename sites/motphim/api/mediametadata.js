import SiteMediaMetadata from '../../base/api/base_mediametadata.js';
import aes from '../../../utils/aes.js';
import {
    AESConfig
} from '../config.js'
import request from 'request-promise';

const FAKE_HEADERS = {
    "Content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    "User-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36",
    "Origin": "https://motphim.net",
    "Referrer": "https://motphim.net/",
    "Accept-language": "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7,vi;q=0.6",
};


const MOTPHIM_BASE_URL = "https://motphim.net/xem-phim/p"
const MOTPHIM_API = "https://api.motphim.org/"
const MOTPHIM_MIRROR_LINK_API = "https://iapi.motphim.org/"

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

            metaData = {
                "dataLink": dataLink,
                "vId": vId,
                "slug": slug,
                "eId": aux["episodeID"],
                "filmId": aux["movieID"]
            }
        } catch (e) {
            console.log("MotphimMediadata._parseMetadataFromSite().\n" + e);
        }
        return metaData;
    }

    async _fetchApi(aux) {
        let apiResp = null;
        try {
            apiResp = JSON.parse(await request({
                uri: MOTPHIM_API,
                headers: FAKE_HEADERS,
                body: `x_dataLink=${aux.dataLink}&x_subTitle=&x_eId=${aux.eId}&x_vId=${aux.vId}&x_slug=${aux.slug}`,

                method: "POST"
            }));
            if (!apiResp.status)
                throw "Invalid Resp.\n" + JSON.stringify(apiResp);
            console.log(apiResp)


            //apiResp["playlist"] is somtimes an array or a dict
            let toDecrypt = Array.isArray(apiResp["playlist"]) ? [apiResp["playlist"]] : 
                                                                  Object.keys(apiResp["playlist"]).map( k => {
                                                                        apiResp["playlist"][k]
                                                                    }) 
            for (const item of apiResp["playlist"]) {
                item.forEach(f => {
                    try {
                        f.file = aes.dec(f.file, AESConfig.aesKey);
                    } catch (e) {
                        console.log("Failed to AES decrypt: " + f.file);
                    }
                });
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
                    metadatas.push({
                        "type": "video-sources",
                        "data": p
                    });
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