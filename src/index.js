const stdinListener = require("./tools/stdin/stdin.js").stdinListener;
const chalk = require("chalk");

async function main() {
    stdinListener();
}

//Kill the process after been idle for 1 minutes
setTimeout(() => {
    console.log(chalk.red("Process killed: ") + "Process has been idle for 1 minute.");
    console.log("Bye, bye! (Dartcher)" + chalk.magenta(" <3"));
    process.exit();
}, 60000);

main();