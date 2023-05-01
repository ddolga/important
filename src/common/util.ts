import * as fs from "fs";
import * as np from "path";
import {ImportMap} from "./scanner";

interface PrintMapOptions {
    internal?: boolean,
    changed?: boolean
}

export function printMap(map: ImportMap, opt: PrintMapOptions = {internal: false, changed: false}) {
    const arr = Array.from(map.values())
        .map(v => {
            const {source,...rest} = v;
            return rest;
        })
        .map(v => {
            const ia = v.imports.filter((imp) => {
                if (opt.internal && imp.external) {
                    return false;
                }
                if (opt.changed && !imp.replace) {
                    return false;
                }
                return true;
            })
            if (ia.length !== v.imports.length) {
                v.imports = ia;
            }
            return v;
        }).filter(v => v.imports.length > 0);
    fs.writeFileSync('map.json', JSON.stringify(arr));
}

export function stripExtension(path) {
    const ext = np.extname(path);
    return path.replace(ext, '');
}
