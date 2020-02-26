import CACHE_CONFIG from '../configs/cache_config';
import {
    moduleUseCache
} from "../utils/helper.js"


export function setupLocalCache() {
    for (const moduleName of Object.keys(CACHE_CONFIG)) {
        moduleUseCache(moduleName, new CACHE_CONFIG[moduleName].cacheManager(CACHE_CONFIG[moduleName].settings))
    }

}