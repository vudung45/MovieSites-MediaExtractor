import ProxyBase from "./base.js";
import request from "request-promise";
import parse from "node-html-parser";


const BASE_URL = "https://proxygather.com/"

const LEVEL_SWITCHER = {
    "Transparent": "low", // lowest
    "Anonymous": "medium", // medium
    "Elite": "best"

}
// proxies from proxygather.com
class ProxyGather extends ProxyBase {
    constructor(cacheManager=null) {
        super(cacheManager, "ProxyGather", ["_getProxiesList"]);
    }

    async _getProxiesList(aux){
        let options = "urlPath" in aux ? aux.urLPath : ""; //ex: proxylist/country/?c=Vietnam
        let apiPath = `${BASE_URL}/${options}`;
        let proxies = [];
        let urlResp = null;
        try {
            urlResp = await request({
                "uri": apiPath,
                "headers": {
                        "Content-type" : "application/x-www-form-urlencoded; charset=UTF-8",
                        "User-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36",
                        "Accept-language": "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7,vi;q=0.6",
                }
            });
        } catch (e) {
            console.log("ProxyGather._getProxiesList(). Error fetching "+apiPath)
        }

        if(!urlResp)
            return null;
                

        let regexSearch = [...urlResp.matchAll(/gp.insertPrx\(({.*})\);/)];
        for(let i = 0; i < regexSearch.length; ++i) {
            try {
                let proxyData = JSON.parse(regexSearch[i][1]);
                proxies.push({"ip": proxyData["PROXY_IP"], "port": parseInt(proxyData["PROXY_PORT"],16), "level": LEVEL_SWITCHER[proxyData["PROXY_TYPE"]]});
            } catch(e) {
                 console.log("ProxyGather._getProxiesList(). Error parsing: "+regexSearch[i][1]);
            }

        }
        return proxies.length ? proxies : null;
    }

    async getProxy(aux={}){
        let proxiesList = await this._getProxiesList(aux); // utilizes cache
        if(!proxiesList)
            return null;
        let proxy = proxiesList[Math.floor(Math.random() * proxiesList.length)];
        console.log(`${proxy["ip"]}:${proxy["port"]}`);
        return `http://${proxy["ip"]}:${proxy["port"]}`; // pick a random one
    }

}

module.exports = new ProxyGather();
