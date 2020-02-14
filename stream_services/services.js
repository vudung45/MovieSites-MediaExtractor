/* export services here */
import Hydrax from './hydrax.js';
import VuViPhimStream from './vuviphimxyz.js';
import MotphimStream from './motphim.js';
import {getProp} from '../utils/helper.js';


exports.Hydrax = Hydrax;
exports.VuViPhimStream = VuViPhimStream;
exports.MotphimStream = MotphimStream;

//driver for each streaming service
exports.simpleGetLinkDriver = async function(aux) {
    let medias = [];
    let url = aux["url"];
    if(url.includes("hydrax.net")) {
        let hlsMedias = await exports.Hydrax.getMediaSource(
            {
               "slug": url.split("watch?v=")[1],
               "key": getProp(aux, "key"),
               "origin": getProp(aux, "origin") ? aux["origin"] : url
            });  

        if(hlsMedias)
            medias.push(hlsMedias);
      
    } else if(url.includes("vuviphim")) {
        let videoSources = await exports.VuViPhimStream.getMediaSource({
               "url": url
            }); 
        if(videoSources)
            medias.push(videoSources);
    } else if(url.includes("motphim.net/player")) {
        let urlObj = new URL(url);
        let videoSources = await exports.MotphimStream.getMediaSource({
               "d": urlObj.searchParams.get("d")
        }); 
        if(videoSources)
            medias.push(videoSources);
    }
    return medias.length == 0 ? null : medias;
}
// exports.GoogleDrive = new GoogleDrive();
