import {extractHostname, getProp} from './helper.js'

export default class MediaSource {
    constructor(source, mediaType="iframe", label=null) {
        this.source = source;
        this.mediaType = mediaType;
        this.label = label;
    }

    static fromJson(json) {
        return new MediaSource(getProp(json, "source"), getProp(json, "type"), getProp(json, "label"));
    }

    getJson()
    {
        return {
            "source": this.source,
            "type": this.mediaType,
            "label": this.label,
            "host" : extractHostname(this.source),
        };
    }
}