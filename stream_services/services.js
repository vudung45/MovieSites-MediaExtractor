/* export services here */
import Hydrax from './hydrax.js';
import VuViPhimStream from './vuviphimxyz.js';
import {getProp} from '../utils/helper.js';


exports.Hydrax = Hydrax;
exports.VuViPhimStream = VuViPhimStream;

//driver for each streaming service
exports.simpleGetLinkDriver = async function(aux) {
    let medias = [];
    let url = aux["url"];
    if(url.includes("hydrax.net")) {
        try {
            let hlsMedias = await exports.Hydrax.getMediaSource(
                {
                   "slug": url.split("watch?v=")[1],
                   "key": getProp(aux, "key"),
                   "origin": getProp(aux, "origin") ? aux["origin"] : url
                });  

            if(hlsMedias)
                medias.push(hlsMedias);
        } catch (e) {
            console.log("Error getting hydrax video-source: \n"+e);
        }
    } else if(url.includes("vuviphim")) {
        try {
            let videoSources = await exports.VuViPhimStream.getMediaSource({
                   "url": url
                }); 
            if(videoSources)
                medias.push(videoSources);
        } catch (e) {
            console.log("Error getting vuviphim.xyz video-source: \n"+e);
        }
    }
    return medias.length == 0 ? null : medias;
}
// exports.GoogleDrive = new GoogleDrive();
