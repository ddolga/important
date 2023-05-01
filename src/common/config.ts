export class Config {

    targetDir: string;
    sourceDir: string;
    compatibleExtensions: string[];

    constructor() {
        const {TARGET_DIR, SOURCE_DIR, COMPATIBLE_EXTENSIONS} = process.env;
        this.targetDir = TARGET_DIR;
        this.sourceDir = SOURCE_DIR;
        this.compatibleExtensions = COMPATIBLE_EXTENSIONS ? COMPATIBLE_EXTENSIONS.split(',') : []
    }
}
