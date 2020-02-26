
import Base from "./base.js";
import request from "request-promise";
import {getProp, LocalPaste, getRedirectLink} from "../utils/helper.js"
import urljoin from "url-join";
import Promise from 'promise';



class StandardM3U8Genator extends Base {
    constructor(cacheManager=null, paster=LocalPaste) {
        super(cacheManager, "StandardM3U8Genator", ["genM3U8", "fetchContent"]);
        this.paster = paster;
    }

    async fetchContent(aux){
        let src = aux["src"];
        let headers = getProp(aux, "headers")
        let urlObj = new URL(src);
        let urlResp = await request({
            uri: src,
            method: "GET",
            headers: headers ? headers : {
                            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36",
                            "Origin": urlObj.origin,
                            "Referer": urlObj.origin,
                            "Accept-language": "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7,vi;q=0.6",
            }
        });
        return urlResp;
    }

    async genM3U8(aux) {
        let urlResp = await this.fetchContent(aux); // utilize cache
        if(!urlResp)
            throw "fetchContent() returns null"

        if(urlResp.includes("#EXT-X-STREAM-INF"))
            return await this._processPlaylist(urlResp, aux, getProp(aux, "redirectLink", true), getProp(aux, "useGoogleProxy", false));
        else
            return await this._processListItem(urlResp, aux, getProp(aux, "redirectLink", true), getProp(aux, "useGoogleProxy", false));
    }

    async _processPlaylist(m3u8Content, aux, redirectLink=true, useGoogleProxy=false) {
        if(!m3u8Content)
            throw "_processPlaylist() : m3u8Content is null ";
        let regx = new RegExp("#EXT-X-STREAM-INF:.*?(?: |\n)+(.*?)(?: |$)", "gm");
        let myArray;
        let matches = [];
        while((myArray = regx.exec(m3u8Content)) != null){
            matches.push(myArray);
        }
        let urlObj = new URL(aux["src"]);
        let urls = matches.map(match => match[1]);
        let processedUrls = urls.slice();
        for(let i = 0; i < urls.length; ++i) {
            if(urls[i].substring(0,2) !== "//" && urls[i].substring(0,4) !== "http"){
                if(urls[i].charAt(0) === '/') // absolute path
                    processedUrls[i]= urljoin(urlObj.origin, urls[i]);
                else  {// relattive path
                    let parentPath = urlObj.href.split("/");
                    parentPath.pop(); // /path/playlist.m3u8 --> /path
                    processedUrls[i] = urljoin(parentPath.join("/"), urls[i]);
                }
            }       
        }
        let asyncTasks = processedUrls.map(url => this.fetchContent({...aux, src : url}));
        let subPlaylistsContents = await Promise.all(asyncTasks);
        let i = 0;
        asyncTasks = subPlaylistsContents.map(content => {
            i += 1;
            if(!content)
                throw "fetchContent() returns null! for url: " + processedUrls[i-1];
            else
                return this._processListItem(content, {...aux, src: processedUrls[i-1]}, redirectLink, useGoogleProxy)
        });

        let subPlaylistsPastes = await Promise.all(asyncTasks);
        for(let i = 0; i < urls.length; ++i) {
            if(!subPlaylistsPastes[i])
                throw "Failed to process url "+urls[i]
            m3u8Content = m3u8Content.replace(urls[i], subPlaylistsPastes[i]);    
        }

        return await this.paster.createPaste("", m3u8Content);
    }

    async _processListItem(m3u8Content, aux, redirectLink=true, useGoogleProxy=false) {
        let urlObj = new URL(aux["src"]);
        let regx = new RegExp("#EXTINF:.*?,(?:\n#EXT-X-BYTERANGE:.*?)?(?: |\n)+(.*?)(?: |$)", "gm");
        let myArray;
        let urlsMatches = [];
        while((myArray = regx.exec(m3u8Content)) !== null){
            urlsMatches.push(myArray);
        }
        let urls = urlsMatches.map(m => m[1]);
        let processedUrls = urls.slice();
        for (let i = 0; i < urls.length; ++i) {
            if (urls[i].substring(0,2) != "//" && urls[i].substring(0,4) != "http"){
                if(urls[i].charAt(0) == "/") { //absolute path
                    processedUrls[i] = urljoin(urlObj.href, urls[i]);
                } else {
                    let parentPath = urlObj.href.split("/");
                    parentPath.pop(); // /path/playlist.m3u8 --> /path
                    processedUrls[i] = urljoin(parentPath.join("/"), urls[i]);
                }
            }
        }

        if (redirectLink) {
            try {

                let asyncTasks = processedUrls.map(u => getRedirectLink({
                    uri: u,
                    "headers": {
                        "Origin": urlObj.origin,
                        "Referer": urlObj.origin
                    }
                }));
                processedUrls = await Promise.all(asyncTasks);
            } catch(e) {
                console.log(e);
                console.log("A promise failed while getting redirect links for m3u8 ("+aux["src"]+"), chunk: ");
                console.log(processedUrls);
                return null;
            }
        }

        if(useGoogleProxy) {
            for (let i = 0; i < processedUrls.length; ++i) {
                if(!processedUrls[i].includes("google"))
                    processedUrls[i] = "//vod-cdn-turbofilm-focus-opensocial.googleusercontent.com/gadgets/proxy?container=focus&url="+encodeURIComponent(processedUrls[i]);

            }
        }
        for (let i = 0; i < urls.length; ++i)
            m3u8Content = m3u8Content.replace(urls[i], processedUrls[i]);

        return await this.paster.createPaste("", m3u8Content);
    }
}

module.exports = new StandardM3U8Genator();
