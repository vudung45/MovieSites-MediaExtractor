import ProxyBase from "./base.js";
import request from "request-promise";
import parse from "node-html-parser";


const BASE_URL = "http://list.didsoft.com/get?email=davidvu98@gmail.com&pass=6w7zmm&pid=http1000&http=yes&showcountry=no&level=1"

const LEVEL_SWITCHER = {
    "Transparent": "low", // lowest
    "Anonymous": "medium", // medium
    "Elite": "best"

}
// proxies from proxygather.com
class DIDSoftProxy extends ProxyBase {
    constructor(cacheManager=null) {
        super(cacheManager, "DIDSoftProxy", ["_getProxiesList"]);
    }

    async _getProxiesList(aux){
        let options = "urlPath" in aux ? aux.urlPath : ""; //ex: &https=yes
        let apiPath = `${BASE_URL}`;
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
            console.log("DIDSoftProxy._getProxiesList(). Error fetching "+apiPath)
        }

        if(!urlResp)
            return null;
                
        let lines = urlResp.split("\n")
        for(let i = 0; i < lines.length; ++i) {
            try {
                let [ip,port] = lines[i].split(":");
                proxies.push({"ip": ip, "port": parseInt(port), "level": "medium"});
            } catch(e) {
                 console.log("DIDSoftProxy._getProxiesList(). Error parsing: "+lines[i]);
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

module.exports = new DIDSoftProxy();
