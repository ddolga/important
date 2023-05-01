import * as fs from "fs";

export function printMap(map: Map<string, unknown>) {
    const arr = Array.from(map.values()).map(v => v);
    fs.writeFileSync('map.json', JSON.stringify(arr));
}
