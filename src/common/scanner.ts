import * as process from "process";
import * as np from "path";
import * as fs from "fs";
import {Config} from "./config";
import {matchImportsRegEx} from "./const";


// const SOURCE_DIR = 'src';
// const COMPATIBLE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

export class ImportMap extends Map<string, CodeFile> {

    public iterateImports(callback) {

        for (let codeFile of this.values()) {
            for (let imp of codeFile.imports) {
                callback(this, codeFile, imp)
            }
        }
    }

}

export interface CodeFile {
    name: string,
    path: string,
    fullPath: string,
    imports: ImportEntry[],
    source: string,
    cycle: boolean,
}

export interface ImportEntry {
    input: string,
    ref: string,
    file: CodeFile
    external: boolean,
    replace?: string
}


export default class Scanner {

    private map: ImportMap = new ImportMap();
    private readonly sourceDir: string;

    constructor(private readonly config: Config) {
        const currDir = this.getRootDirectory(config);

        console.log('Root directory: ' + currDir)
        this.sourceDir = np.join(currDir, config.sourceDir);
        console.log('Source directory: ' + this.sourceDir)
    }

    private getRootDirectory(config) {
        const targetDir = config.targetDir;
        if (!targetDir || targetDir === '.') {
            return process.cwd();
        }
        return targetDir;
    }

    public scan() {
        this.buildProjectMap(this.sourceDir);
        this.linkImportsToCodeFiles();
        // this.checkCyclicalReferences();
        return this.map;
    }

    private buildProjectMap(path) {

        const isDirectory = fs.lstatSync(path).isDirectory();
        if (isDirectory) {
            const files = fs.readdirSync(path);
            for (let file of files) {
                this.buildProjectMap(np.resolve(path, file))
            }
        } else {
            const ext = np.extname(path);
            if (this.config.compatibleExtensions.includes(ext)) {
                this.collectImportStatements(path)
            }
        }
    }

    private collectImportStatements(fullPath) {

        const b = fs.readFileSync(fullPath);
        const str = b.toString();

        const info = np.parse(fullPath);
        const p = np.join(info.dir, info.name)
        const relativePath = np.relative(this.sourceDir, p);

        const codeFile: CodeFile = {
            name: info.name,
            fullPath: fullPath,
            path: relativePath,
            source: str,
            imports: new Array<ImportEntry>(),
            cycle: false
        };

        const m = str.matchAll(matchImportsRegEx);
        for (let mElement of m) {
            const imp: ImportEntry = {
                input: mElement[0],
                ref: mElement[2],
                file: null,
                external: false
            }
            codeFile.imports.push(imp);
        }

        if (codeFile.imports.length > 0) {
            this.map.set(codeFile.path, codeFile);
        }
    }

    private linkImportsToCodeFiles() {

        this.map.iterateImports((map, codeFile, imp) => {
            const targetPath = np.join(codeFile.path, '../', imp.ref)
            imp.external = !map.has(targetPath);
            if (!imp.external) {
                imp.file = map.get(targetPath);
            }
        })
    }


    private checkCyclicalReferences() {

        function recurse(link: ImportEntry, start: CodeFile, level) {
            if (!link.external && link.file) {
                console.log(`Level: ${level}: ${link.file.name}`);
                if (link.file === start) {
                    start.cycle = true;
                    console.log('Cyclical Reference: ', start.name);
                    return;
                }
                for (let l2 of link.file.imports) {
                    recurse(l2, start, level + 1);
                }
            }
        }

        this.map.iterateImports((map, start, link) => {
            recurse(link, start, 0);
        })
    }

}
