import Hydrax from "./hydrax.js";
import LocalJsonCacheManager from '../cache_manager/localjsoncache.js'

let hydraxCache = new LocalJsonCacheManager({
    "path": __dirname + '/cache/hydrax.cache'
}, false);


(async function() {
    console.log(await Hydrax.getMediaSource({
        "slug": "DAFBiqZVq",
        "key": "bf54163828fbcf4178fe249641b1f519"
    }));
})();

(async function() {
    console.log(await Hydrax.getMediaSource({
        "slug": "EQ7bQhon0",
        "origin": "https://hydrax.net"
    }));
})();