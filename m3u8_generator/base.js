import Cacheable from "../utils/cacheable.js"

export default class M3U8GeneratorBase extends Cacheable {
    constructor(cacheManager, prefix, functions = ["genM3U8"]) {
        super(cacheManager, prefix, functions)
    }


    genM3U8(aux) {
        throw "not yet implemented";
    }
}