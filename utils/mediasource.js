import {extractHostname, getProp} from './helper.js'

export default class MediaSource {
    constructor(source, mediaType="iframe", label=null) {
        this.source = source;
        this.mediaType = mediaType;
        this.label = label;
    }

    static createFrom(json) {
        return new MediaSource(getProp(json, "file"), getProp(json, "type"), getProp(json, "label"));
    }

    getJson()
    {
        return {
            "file": this.source,
            "type": this.mediaType,
            "label": this.label,
        };
    }

    toString() {
        return JSON.stringify(this.getJson());
    }
}