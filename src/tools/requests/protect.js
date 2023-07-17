const chalk = require("chalk");
const axios = require("axios");

exports.protectPack = function protectPack(fileDirectory, host) {
    console.log(chalk.magenta(fileDirectory));
    console.log(chalk.magenta(host));
}