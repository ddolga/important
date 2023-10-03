import {MATCH_IMPORTS_REGEX} from "./types/const";
import {ImportMap} from "./types/ImportMap";
import * as fs from "fs";

const replacer = (replace) => (source) => {
    const mElements = MATCH_IMPORTS_REGEX.exec(source);
    if (mElements[1]) {
        return source.replace(MATCH_IMPORTS_REGEX, `import $2 from "${replace}";`);
    } else {
        return source.replace(MATCH_IMPORTS_REGEX, `import "${replace}";`);
    }
}

export function updateImports(map: ImportMap) {
    map.iterateImports((map, codeFile, imp) => {
        if (!imp.external && imp.replace) {
            codeFile.source = codeFile.source.replace(imp.input, replacer(imp.replace))
            codeFile.hasChanged = true;
        }
    })
}

export function saveChanges(map) {
    for (let codeFile of map.values()) {
        if(codeFile.hasChanged && codeFile.source){
            fs.writeFileSync(codeFile.fullPath, codeFile.source);
        }
    }


}
