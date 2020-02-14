import request from 'request-promise';


export default class PasteBin {
    constructor(apiKey) {
        this.apiKey = apiKey
    }

   async createPaste(title, content,  expire='1440M', mode="0", returnRaw=true) {
        try {
            let apiResp = (await request({
                    "method": "POST",
                    "uri" : "https://pastebin.com/api/api_post.php",
                    "form": {
                        "api_dev_key": this.apiKey,
                        "api_paste_code": content,
                        "api_option": "paste",
                        "api_paste_private": mode
                    },
                    "headers": {
                            "Content-Type": "application/text",
                            "Content-type" : "application/x-www-form-urlencoded; charset=UTF-8",
                            "User-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36",
                     }
            }));
            if(!returnRaw)
                return apiResp;
            else 
                return "https://pastebin.com/raw/"+apiResp.split("/").pop()
        } catch (e) {
            console.log(e)
        }
        return null;
    }
}