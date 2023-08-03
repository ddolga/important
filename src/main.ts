import yargs from "yargs";
import {hideBin} from "yargs/helpers"
import chalk from "chalk";
import convertRelative from "./commands/convertRelative";
import {saveChanges, updateImports} from "./common/updateImports";
import {printMap} from "./common/util";
import * as dotenv from 'dotenv';
import {Config} from "./common/config";

const optionT = {alias: "type", describe: 'Convert Type', choices: ['absolute', 'relative'], demandOption: true};

dotenv.config()


const commandRunner = (func) => (argv) => {

    const config = new Config();
    const importMap = func(config, argv);
    updateImports(importMap);
    if (argv.save) {
        saveChanges(importMap);
    }
    printMap(importMap, {internal: true, changed: true, sourceText: false,fileName:'rewriteMap.json'});
}

const handleConvert = commandRunner((config, argv) => {
    switch (argv.type) {
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
            yargs.option('t', optionT)
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
