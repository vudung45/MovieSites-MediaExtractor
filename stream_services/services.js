/* export services here */
import Hydrax from './hydrax.js';
import GoogleDrive from './googledrive.js';
import LocalJsonCacheManager from '../cache_manager/localjsoncache.js'


let hydraxCache = new LocalJsonCacheManager({
	"path":  __dirname+'/cache/hydrax.cache'
});

exports.Hydrax = new Hydrax(hydraxCache);
exports.GoogleDrive = GoogleDrive;
