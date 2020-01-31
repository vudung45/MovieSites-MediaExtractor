
export default class CacheManager {
	constructor(settings, syncRoutine)	{
		this.settings=settings
		this._processSettings();
		if(syncRoutine)
			this.syncRoutine();
	}

	_processSettings()
	{

	}

	async load(key) {

	}

	async update(key, ttl=3600) {

	}

	async syncLocalData(key) {
		/* sync in memory data with remote cache */
	}

	async syncRoutine() {
		/* iterate through each key and delete expired TTL keys */

	}
}