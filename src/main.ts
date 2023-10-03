import yargs from "yargs";
import {hideBin} from "yargs/helpers"
import chalk from "chalk";
import convertRelative from "./commands/convertRelative";
import {saveChanges, updateImports} from "./common/updateImports";
import {printMap} from "./common/util";
import * as dotenv from 'dotenv';
import Config from "./common/types/config";
import {ImportMap} from "./common/types/ImportMap";

const optionT = {alias: "type", describe: 'Convert Type', choices: ['absolute', 'relative'], demandOption: true};
const optionP = {alias: "path", describe: 'Target Path', demandOption: true};

type FuncType = (config: Config) => ImportMap;

dotenv.config()

const commandRunner = (func: FuncType) => (argv) => {
    const config = new Config(argv);
    const importMap = func(config);
    updateImports(importMap);
    if (config.save) {
        saveChanges(importMap);
    }
    printMap(importMap, {internal: true, changed: true, sourceText: false, fileName: 'rewriteMap.json'});
}

const handleConvert = commandRunner((config) => {
    switch (config.type) {
        case 'relative':
            return convertRelative(config);
        case 'absolute':
            break;
    }
})

function imp() {
    yargs(hideBin(process.argv))
        .scriptName('imp')
        .command('convert', 'convert import paths', () => {
            yargs.option('t', optionT);
            yargs.option('p', optionP)
        }, handleConvert)
        .demandCommand(1, chalk.red("At least one command must be specified"))
        .option('s', {
            alias: 'save',
            describe: 'save changes',
            boolean: true
        })
        .argv;
}

imp();
