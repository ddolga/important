import yargs from "yargs";
import {hideBin} from "yargs/helpers"
import chalk from "chalk";
import convertRelative from "./commands/convertRelative";
import {updateImports} from "./common/updateImports";
import {printMap} from "./common/util";
import * as dotenv from 'dotenv';
import {Config} from "./common/config";

const optionT = {alias: "type", describe: 'Convert Type', choices: ['absolute', 'relative'], demandOption: true};

dotenv.config()

function imp() {

    const config = new Config();

    yargs(hideBin(process.argv))
        .scriptName('imp')
        .command('convert', 'convert import paths', () => {
            yargs.option('t', optionT)
        }, handleConvert)
        .demandCommand(1, chalk.red("At least one command must be specified"))
        .argv;


    function handleConvert(argv) {
        let importMap;
        switch (argv.type) {
            case 'relative':
                importMap = convertRelative(config);
                break;
            case 'absolute':
                break;
        }

        updateImports(importMap);
        printMap(importMap);
    }
}

imp();
