const chalk = require("chalk");
const { clearOutputFolder } = require('../folder/clearOutputFolder.js');
const { packCreator } = require('../packcreator/packcreator.js');
const { help } = require('./command/help.js');
const { packCommand } = require('./command/pack.js');
const { listCommand, list } = require('./command/list.js');

exports.stdinListener = function stdinListener(files) {
    let inCreatorMode = false;
    let pack = {
        packId: "",
        elements: [],
        isProtected: undefined,
        step: 0
    };

    const processInput = async (input) => {
        const command = input.trim(); // Supprimer les espaces inutiles en début et fin de commande
        
        if (!inCreatorMode) {
            if (command === "/help") {
                help();
            } else if (command === "/pack") {
                packCommand();
            } else if (command === "/list") {
                listCommand();
            } else if (command === "/clear") {
                clearOutputFolder();
            } else if (command.startsWith("/list ")) {
                const type = command.split(" ")[1];
                list(files, type);
            } else if (command.startsWith("/pack ")) {
                if (command.startsWith("/pack create")) {
                    inCreatorMode = true;
                    packCreator(files, input, pack);
                } else {
                    console.log("Invalid command. Type /help to see available commands.");
                }
            } else if (command === "/exit") {
                process.exit(); // Quitter le processus
            } else {
                console.log("Invalid command. Type /help to see available commands.");
            }
        } else {
            // Pack creator mode
            if (command === "/exit") {
                inCreatorMode = false;
                pack = {
                    packId: "",
                    elements: [],
                    isProtected: undefined,
                    step: 0
                };
                console.log("Exiting creator mode.");
            } else {
                pack = packCreator(files, input, pack)
            }
        }
    };
    
    console.log("\n\n");
    console.log(chalk.green('/help') + " to start\n");
    
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", async (data) => {
    const input = data.trim();
    
    await processInput(input);
    
    process.stdout.write("\n");
    process.stdout.write("> ");
    });
    
    process.stdin.on("/exit", () => {
        process.exit();
    });
    
    process.stdout.write("> ");
}



