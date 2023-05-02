import {ImportMap} from "./scanner";
import {matchImportsRegEx} from "./const";
import * as fs from "fs";

const replacer = (replace) => (match) => {
    return match.replace(matchImportsRegEx, `import $1 from "${replace}";`);
}

export function updateImports(map: ImportMap) {
    map.iterateImports((map, codeFile, imp) => {
        if (!imp.external && imp.replace) {
            codeFile.source = codeFile.source.replace(imp.input, replacer(imp.replace))
        }
    })
}

export function saveChanges(map){
    for (let codeFile of map.values()) {
        fs.writeFileSync(codeFile.fullPath,codeFile.source);
    }


}
