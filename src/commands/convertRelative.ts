import * as np from "path";
import Scanner, {getCodeFile, ImportMap} from "../common/scanner";
import {stripExtension} from "../common/util";


function initMap(config) {
    const scanner = new Scanner(config);
    return scanner.scan();
}

export default function convertRelative(config): ImportMap {

    const map = initMap(config);
    map.iterateImports((map, codeFile, imp) => {
        if (!imp.external) {
            const f = np.resolve(codeFile.fullPath, '../');

            let replacement = np.relative(f, getCodeFile(imp.file, map).fullPath);
            replacement = stripExtension(replacement);
            replacement = replacement.replaceAll('\\', '/');
            if (!replacement.startsWith('..') && !replacement.startsWith('.')) {
                replacement = './' + replacement;
            }
            if (imp.ref !== replacement) {
                imp.replace = replacement;
            }
        }
    })

    return map;
}
