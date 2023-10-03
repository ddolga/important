import * as process from "process";
import * as np from "path";
import * as fs from "fs";
import {stripExtension} from "./util";
import {CodeFile, ImportEntry, ImportMap} from "./types/ImportMap";
import {COMPATIBLE_EXTENSIONS, INCLUDED_ASSET_EXTENSIONS, MATCH_IMPORTS_REGEX} from "./types/const";
import Config from "./types/config";

export function getCodeFilePath(path: string, map: ImportMap): CodeFile {
    const boo = stripExtensionOnCodeFiles(path);
    return map.get(boo);
}

function isDirectory(path: string) {
    if (!fs.existsSync(path))
        return false;

    return fs.lstatSync(path).isDirectory();
}

const trimQuotes = /['"]*/gm;

export function stripExtensionOnCodeFiles(path) {
    return INCLUDED_ASSET_EXTENSIONS.includes(np.extname(path)) ? path : stripExtension(path);
}

export default class Scanner {

    private map: ImportMap = new ImportMap();
    private readonly sourceDir: string[];

    constructor(private readonly config: Config) {
        const rootDirectory = this.getRootDirectory(config);
        console.log('Root directory: ' + rootDirectory)
        this.sourceDir = this.config.sourceDir.map(dir => np.join(rootDirectory, dir)).filter(p => isDirectory(p));
    }

    private getRootDirectory(config: Config) {
        const targetDir = config.targetDir;
        if (!targetDir || targetDir === '.') {
            return process.cwd();
        }
        return targetDir;
    }

    public scan() {
        this.sourceDir.forEach(p => this.buildProjectMap(p));
        this.linkImportsToCodeFiles();
        return this.map;
    }

    private buildProjectMap(srcPath: string, currPath: string = srcPath) {
        console.log('Scanning directory: ' + currPath)
        if (isDirectory(currPath)) {
            const files = fs.readdirSync(currPath);
            for (let file of files) {
                this.buildProjectMap(srcPath, np.resolve(currPath, file))
            }
            return;
        }

        const ext = np.extname(currPath);
        if (COMPATIBLE_EXTENSIONS.includes(ext)) {
            this.collectImportStatements(srcPath, currPath)
        } else if (INCLUDED_ASSET_EXTENSIONS.includes(ext)) {
            this.collectImportedAsset(srcPath, currPath);
        }
    }

    private collectImportedAsset(srcPath: string, fullPath: string) {

        const info = np.parse(fullPath);
        // const p = np.join(info.dir, info.name)
        const relativePath = np.relative(srcPath, fullPath);


        const codeFile: CodeFile = {
            name: info.name,
            fullPath: fullPath,
            path: relativePath,
            source: '',
            imports: [],
            directory: false,
            isAsset: true,
            hasChanged: false
        };

        this.map.set(codeFile.path, codeFile);
    }

    private collectImportStatements(srcPath: string, fullPath: string) {

        const b = fs.readFileSync(fullPath);
        const str = b.toString();

        const info = np.parse(fullPath);
        const p = np.join(info.dir, info.name)
        const relativePath = np.relative(srcPath, p);


        const codeFile: CodeFile = {
            name: info.name,
            fullPath: fullPath,
            path: relativePath,
            source: str,
            directory: false,
            imports: new Array<ImportEntry>(),
            isAsset: false,
            hasChanged: false
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
            const matchPath = stripExtensionOnCodeFiles(targetPath);
            imp.external = !map.has(matchPath);
            if (!imp.external) {
                imp.file = targetPath;
            }
        })
    }
}
