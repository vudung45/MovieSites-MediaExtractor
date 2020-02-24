import M3U8Generator from "./standard_generator.js";


(function() {
    M3U8Generator.genM3U8({
        "src": "https://s0.vdicdn.com/playlist/22d21fd5799fe437420c0900ee6ec709/22d21fd5799fe437420c0900ee6ec709.m3u8",
        "useGoogleProxy": false
    }).then(r => console.log(r));
})();