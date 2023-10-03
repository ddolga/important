
type ConversionType = 'relative' | 'absolute';
export default class Config {
    private _sourceDir: string[];
    private _targetDir:string;
    private _save:boolean;
    private _type:ConversionType;

    get sourceDir():string[]{
        return this._sourceDir;
    }

    get targetDir():string{
        return this._targetDir;
    }

    get save():boolean{
        return this._save;
    }

    get type():ConversionType{
        return this._type;
    }

    constructor(argv) {
        const {SOURCE_DIR} = process.env;
        this._sourceDir = SOURCE_DIR ? SOURCE_DIR.split(' '): [];
        this._targetDir = argv.path;
        this._save = argv.save;
        this._type = argv.type;
    }
}
