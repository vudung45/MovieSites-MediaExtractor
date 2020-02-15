import Cacheable from "../utils/cacheable.js"

export default class ProxyBase extends Cacheable {
    constructor(cacheManager, prefix, functions=["getProxy"]) {
        super(cacheManager, prefix, functions);
    }


    async getProxy() {
        throw "Not yet implemented";
    }


}