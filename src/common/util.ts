import * as fs from "fs";
import * as np from "path";
import {CodeFile, ImportMap} from "./types/ImportMap";
import {omit} from "lodash";

interface PrintMapOptions {
    internal?: boolean,
    changed?: boolean,
    sourceText?: boolean,
    fileName?: string;
}

export function printMap(map: ImportMap, opt: PrintMapOptions = {
    internal: false,
    changed: false,
    sourceText: false,
    fileName: 'map.json'
}) {

    const {internal, changed, sourceText, fileName} = opt;

    const arr = Array.from(map.values());
    const filtered:CodeFile[] = arr.map(v => sourceText ? v : omit(v, 'source')) // if no sourceText option is selected remove the source field from the entry
        .map(v => {
            const ia = v.imports.filter((imp) => {
                if (internal && imp.external) { // if internal filter set, omit external imports
                    return false;
                }
                if (changed && !imp.replace) { // if changes only filter set, omit unchanged
                    return false;
                }
                return true;
            })
            if (ia.length !== v.imports.length) {
                v.imports = ia;
            }
            return v;
        })
        .filter(v => v.imports.length > 0); // filter out empty imports

    fs.writeFileSync(fileName, JSON.stringify(filtered));
}

export function stripAll(str:string){
    return str.replaceAll("\n","").replaceAll("\r","").replaceAll(';import',';\rimport');
}


export function stripExtension(path) {
    const ext = np.extname(path);
    return path.replace(ext, '');
}
