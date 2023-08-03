import * as np from "path";
import Scanner, {alternativeStringTheory, getCodeFilePath} from "../common/scanner";
import {printMap} from "../common/util";
import {ImportMap} from "../common/ImportMap";


function initMap(config) {
    const scanner = new Scanner(config);
    const importMap = scanner.scan();
    printMap(importMap, {internal: false, changed: false, sourceText: false, fileName: 'sourceMap.json'});
    return importMap;
}

export default function convertRelative(config): ImportMap {

    const map = initMap(config);
    map.iterateImports((map, codeFile, imp) => {
        const f = np.resolve(codeFile.fullPath, '../');

        let replacement = np.relative(f, getCodeFilePath(imp.file, map).fullPath);
        // leave extensions for asset files, i.e. .png, .jpeg, .pdf
        replacement = alternativeStringTheory(replacement);

        replacement = replacement.replaceAll('\\', '/');
        if (!replacement.startsWith('..') && !replacement.startsWith('.')) {
            replacement = './' + replacement;
        }
        if (imp.ref !== replacement) {
            imp.replace = replacement;
        }
    }, (imp) => !imp.external)

    return map;
}
