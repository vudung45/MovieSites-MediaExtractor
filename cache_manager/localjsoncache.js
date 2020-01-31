import CacheManager from './base.js'
import fs from 'fs'
import {sleep} from '../utils/helper.js'
import util from 'util'
import  Promise from 'promise';

export default class LocalJsonCacheManager extends CacheManager {
	constructor(settings, syncRoutine=true) {
		super(settings,syncRoutine);

	}

	_processSettings()
	{
		this.data = {} 
		try {
			this.data = JSON.parse(fs.readFileSync(this.settings["path"]));			
		} catch(e) {
			console.log(e);
		}
	}

	async load(key) {
		if(!(key in this.data)) 
			return null;
		
		this.data[key].access = new Date().getTime();
		this.syncLocalData(); // dont need to await
		return this.data[key].value;
	}

	async delete(key) {
		if(!(key in this.data)) 
			return;

		delete this.data[key]
		this.syncLocalData();

	}

	async update(key, value, ttl=3600) {
		this.data[key] = {
			access: new Date().getTime(),
			ttl: ttl * 1000,
			value: value
		}
		this.syncLocalData();
	}

	async syncLocalData(key) {
		/* sync in memory data with remote cache */
		try {
			fs.writeFile(this.settings["path"], JSON.stringify(this.data), function () {
					return new Promise(() => {});
			});
		} catch(e) {
			console.log(e);
		}
	}

	async syncRoutine() {
		while(true)
		{
			/* iterate through each key and delete expired TTL keys */
			let needUpdate = false;
			Object.keys(this.data).map( k => {
				if(this.data[k].ttl + this.data[k].access < new Date().getTime())
				{
					needUpdate = true;
					delete this.data[k];
				}
			});
			if(needUpdate)
				await syncLocalData();
			await sleep(1000);
		}

	}

}