import {
    getProp
} from '../utils/helper.js'
export default class CacheManager {
    constructor(settings) {
        this.settings = settings;
        this.sync = getProp(settings, "syncRoutine", false);
        this.ttl = getProp(settings, "ttl", 3600);
        this._processSettings();
        if (this.sync)
            this.syncRoutine();
    }

    _processSettings() {

    }

    async load(key) {

    }

    async update(key, ttl = 3600) {

    }

    async syncLocalData(key) {
        /* sync in memory data with remote cache */
    }

    async syncRoutine() {
        /* iterate through each key and delete expired TTL keys */

    }
}