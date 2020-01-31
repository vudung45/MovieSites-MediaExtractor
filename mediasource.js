
export default class MediaSource {
    constructor(source, mediaType="iframe", label="") {
        this.source = source;
        this.mediaType = mediaType;
        this.label = label;
    }


    getJson()
    {
        return {
            "source": this.source,
            "type": this.mediaType,
            "label": this.label,
        };
    }
}