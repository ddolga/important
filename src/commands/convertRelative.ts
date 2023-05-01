import * as np from "path";
import Scanner, {ImportMap} from "../common/scanner";


function initMap(config) {
    const scanner = new Scanner(config);
    return scanner.scan();
}


export default function convertRelative(config): ImportMap {

    const map = initMap(config);
    map.iterateImports((map, codeFile, imp) => {
        if (!imp.external) {
            const f = np.resolve(codeFile.fullPath, '../');
            let replacement = np.relative(f, imp.file.fullPath);
            replacement = replacement.replaceAll('\\', '/');
            if (!replacement.startsWith('..') && !replacement.startsWith('.')) {
                replacement = './' + replacement;
            }
            imp.replace = replacement;
        }
    })

    return map;
}
