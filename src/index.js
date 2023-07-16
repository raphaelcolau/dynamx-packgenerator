const stdinListener = require("./tools/stdin/stdin.js").stdinListener;
const chalk = require("chalk");

async function main() {
    stdinListener();
}

main();