import * as process from "process";
import * as np from "path";
import * as fs from "fs";
import {Config} from "./config";
import {COMPATIBLE_EXTENSIONS, INCLUDED_ASSET_EXTENSIONS, MATCH_IMPORTS_REGEX} from "./const";
import {CodeFile, ImportEntry, ImportMap} from "./ImportMap";
import {stripExtension} from "./util";

export function getCodeFilePath(path: string, map: ImportMap): CodeFile {
    const boo = alternativeStringTheory(path);
    return map.get(boo);
}

const trimQuotes = /['"]*/gm;

export function alternativeStringTheory(path) {
    return INCLUDED_ASSET_EXTENSIONS.includes(np.extname(path)) ? path : stripExtension(path);
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
        return this.map;
    }

    private buildProjectMap(path: string) {

        const isDirectory = fs.lstatSync(path).isDirectory();
        if (isDirectory) {
            const files = fs.readdirSync(path);
            for (let file of files) {
                this.buildProjectMap(np.resolve(path, file))
            }
        } else {
            const ext = np.extname(path);
            if (COMPATIBLE_EXTENSIONS.includes(ext)) {
                this.collectImportStatements(path)
            } else if (INCLUDED_ASSET_EXTENSIONS.includes(ext)) {
                this.collectImportedAsset(path);
            }
        }
    }

    private collectImportedAsset(fullPath: string) {

        const info = np.parse(fullPath);
        // const p = np.join(info.dir, info.name)
        const relativePath = np.relative(this.sourceDir, fullPath);


        const codeFile: CodeFile = {
            name: info.name,
            fullPath: fullPath,
            path: relativePath,
            source: '',
            imports: [],
            directory: false,
        };

        this.map.set(codeFile.path, codeFile);
    }

    private collectImportStatements(fullPath: string) {

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
            directory: false,
            imports: new Array<ImportEntry>(),
        };

        const m = str.matchAll(MATCH_IMPORTS_REGEX);
        for (let mElement of m) {
            const imp: ImportEntry = mElement[1] ? {
                input: mElement[0],
                ref: mElement[3].replaceAll(trimQuotes, '').trim(),
                file: null,
                external: false
            } : {
                input: mElement[0],
                ref: mElement[5].replaceAll(trimQuotes, '').trim(),
                file: null,
                external: false
            }
            codeFile.imports.push(imp);
        }

        this.map.set(codeFile.path, codeFile);
    }

    private stripExtension(path: string) {
        const info = np.parse(path);
        if (info.dir) {
            return np.join(info.dir, info.name);
        }
        return path;
    }

    private linkImportsToCodeFiles() {

        function rootsy(ref: string, root: string) {

            if (ref.startsWith('.')) {
                return np.join(root, '../', ref)
            } else if (ref.startsWith('src/')) {
                const r = ref.replace('src/', '');
                return np.join('.', r);
            }
            return np.join('.', ref);
        }

        this.map.iterateImports((map, codeFile, imp) => {
            const targetPath = rootsy(imp.ref, codeFile.path);
            const matchPath =  alternativeStringTheory(targetPath);
            imp.external = !map.has(matchPath);
            if (!imp.external) {
                imp.file = targetPath;
            }
        })
    }
}
