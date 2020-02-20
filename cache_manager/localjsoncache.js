import CacheManager from './base.js'
import fs from 'fs'
import {
    sleep
} from '../utils/helper.js'
import util from 'util'
import Promise from 'promise';

export default class LocalJsonCacheManager extends CacheManager {
    constructor(settings) {
        super(settings);

    }

    _processSettings() {
        this.data = {}
        try {
            this.data = JSON.parse(fs.readFileSync(this.settings["path"]));
        } catch (e) {
            console.log(e);
        }
    }

    async load(key) {
        if (!(key in this.data))
            return null;

        if (this.data[key].access + this.data[key].ttl < new Date().getTime()) {
            await this.delete(key);
            return null;
        }

        this.data[key].access = new Date().getTime();
        await this.syncLocalData(); // dont need to await
        return this.data[key].value;
    }

    async delete(key) {
        if (!(key in this.data))
            return;

        delete this.data[key]
        await this.syncLocalData();

    }

    async update(key, value, ttl = null) {
        if (!ttl)
            ttl = this.ttl;
        this.data[key] = {
            access: new Date().getTime(),
            ttl: ttl * 1000,
            value: value
        }
        await this.syncLocalData();
    }

    async syncLocalData(key) {
        /* sync in memory data with remote cache */
        return new Promise((resolve, reject) => {
            try {
                fs.writeFile(this.settings["path"], JSON.stringify(this.data), function() {
                    resolve();
                });
            } catch (e) {
                console.log(e);
                resolve();
            }
        });
    }

    async syncRoutine() {
        while (true) {
            /* iterate through each key and delete expired TTL keys */
            let needUpdate = false;
            Object.keys(this.data).map(k => {
                if (this.data[k].ttl != null &&
                    this.data[k].ttl + this.data[k].access < new Date().getTime()) {
                    needUpdate = true;
                    delete this.data[k];
                }
            });
            if (needUpdate)
                await this.syncLocalData();
            await sleep(1000);
        }

    }

}