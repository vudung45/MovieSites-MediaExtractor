const fs = require('fs').promises;
const uuidv1 = require('uuid/v1');
import Config from "../configs/paste_config.js"
import urljoin from "url-join";

export default class LocalPaste {
    constructor(path) {
        this.path = path
    }

    async createPaste(title, content, ext = "m3u8") {
        let fileName = uuidv1() + "." + ext;
        await fs.writeFile(`${this.path}/${fileName}`, content, {
            encoding: "utf-8"
        });
        return urljoin(Config.LocalPaste.httpExportPath, fileName);
    }
}