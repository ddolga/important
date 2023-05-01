import {ImportMap} from "./scanner";
import {matchImportsRegEx} from "./const";

const replacer = (replace) => (match) => {
    const res = match.replace(matchImportsRegEx, `import $1 from "${replace}";`)
    return res;
}

export function updateImports(map: ImportMap) {
    map.iterateImports((map, codeFile, imp) => {
        if (!imp.external) {
            if (imp.replace) {
                codeFile.source = codeFile.source.replace(imp.input, replacer(imp.replace))
            }
        }
    })
}
