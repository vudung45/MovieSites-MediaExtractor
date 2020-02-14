

export default class Cacheable {
    constructor(cacheManager, prefix, functions){
        this.cachePrefix=prefix;
        this.cacheManager = cacheManager;
        functions.forEach((f) => {
            let toWrap = this[f];
            this[`_manual_${f}`] = toWrap;
            this[f] = async function(aux) {
                let cacheKey = this._prefixifyData(aux["cacheKey"]);
                if (!("cacheKey" in aux))
                    cacheKey = this._prefixifyData(JSON.stringify(aux)+`_${f}`);
                let data = null;
                if(this.cacheManager)
                    data = await this.cacheManager.load(cacheKey);

                if(data)
                    return data;

                try {
                    data = await this[`_manual_${f}`](aux);
                } catch (e){
                    console.log(`Error in function ${f}. Error: \n${e}`)
                }
                if(data && this.cacheManager)
                    this.cacheManager.update(cacheKey, data);

                return data;
            };
        });

    }

    _prefixifyData(data) {
        return `${this.cachePrefix}_${data}`
    }


    useCache(cacheManager) {
        this.cacheManager = cacheManager;
    }

}