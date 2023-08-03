type IterateImportsCallback = (map: ImportMap, codeFile: CodeFile, imp: ImportEntry) => void;

type IterateImportsFilter = (ie: ImportEntry) => boolean;

export interface CodeFile {
    name: string,
    path: string,
    fullPath: string,
    imports: ImportEntry[],
    source: string,
    directory: boolean
}

export interface ImportEntry {
    input: string,
    ref: string,
    file: string,
    external: boolean,
    replace?: string
}

export class ImportMap extends Map<string, CodeFile> {

    public iterateImports(callback: IterateImportsCallback, filter?: IterateImportsFilter) {

        for (let codeFile of this.values()) {
            for (let imp of codeFile.imports) {
                if (!filter || filter(imp)) {
                    callback(this, codeFile, imp)
                }
            }
        }
    }

}
