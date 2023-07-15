const chalk = require("chalk");

exports.help = function help() {
    console.log(chalk.blue('/help') + ' - Show this help');
    console.log(chalk.blue('/pack') + ' - help for pack command');
    console.log(chalk.blue('/clear') + ' - clear build folder');
    console.log(chalk.blue('/list <type>') + " - display all parserd files of a type");
}