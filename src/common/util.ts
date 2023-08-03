import * as fs from "fs";
import * as np from "path";
import {ImportMap} from "./ImportMap";

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

    const arr = Array.from(map.values())
        .map(v => {
            if (sourceText) {
                return v;
            }

            const {source, ...rest} = v;
            return rest;
        })
        .map(v => {
            const ia = v.imports.filter((imp) => {
                if (internal && imp.external) {
                    return false;
                }
                if (changed && !imp.replace) {
                    return false;
                }
                return true;
            })
            if (ia.length !== v.imports.length) {
                v.imports = ia;
            }
            return v;
        }).filter(v => v.imports.length > 0);

    fs.writeFileSync(fileName, JSON.stringify(arr));
}

export function stripAll(str:string){
    return str.replaceAll("\n","").replaceAll("\r","").replaceAll(';import',';\rimport');
}


export function stripExtension(path) {
    const ext = np.extname(path);
    return path.replace(ext, '');
}
