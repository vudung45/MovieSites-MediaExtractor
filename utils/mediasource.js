import {
    extractHostname,
    getProp
} from './helper.js'

export default class MediaSource {
    constructor(source, mediaType = "iframe", label = null, permaLink = false) {
        this.file = source;
        this.type = mediaType;
        this.label = label;
        this.permaLink = permaLink;
    }

    static createFrom(json) {
        return new MediaSource(getProp(json, "file"), getProp(json, "type"), getProp(json, "label"), getProp(json, "permaLink", false));
    }

    getJson() {
        return {
            "file": this.file,
            "type": this.type,
            "label": this.label,
        };
    }

    toString() {
        return JSON.stringify(this.getJson());
    }
}