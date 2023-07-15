import chalk from 'chalk';
import { clearOutputFolder } from '../folder/clearOutputFolder.js';
import { packCreator } from '../packcreator/packcreator.js';
import { help } from './command/help.js';

export function stdinListener(files) {
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
                console.log("/pack create <name> - Create a new pack");
                console.log("/pack list - List all packs");
                console.log("/pack list <name> - List all files in a pack");
            } else if (command === "/list") {
                console.log("/list <type> - List all files of a type");
                console.log("\ttype: vehicle, trailer, armor, wheel, engine, sounds, block, block_prop, boat, plane, obj, unknown");
            } else if (command === "/clear") {
                clearOutputFolder();
                console.log("Build folder cleared.");
            } else if (command.startsWith("/list ")) {
                const type = command.split(" ")[1];
                if (!files[type]) {
                console.log("Invalid type: " + type);
                console.log("Valid types: vehicle, trailer, armor, wheel, engine, sounds, block, block_prop, boat, plane, obj, unknown");
                } else {
                    console.log("Files of type: " + type);
                    files[type].forEach(file => {
                        try {
                            console.log(file.file ? " - " +  file.file.split("/")[file.file.split("/").length - 1] : " - " + file.dir.split("/")[file.dir.split("/").length - 1]);
                        } catch (e) {
                            console.log(e);
                        }
                    });
                    console.log("Total of " + files[type].length + " " + type + " files.");
                }
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
      
    console.log("/help to start\n");
    
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



