import chalk from 'chalk';

function stepOutputIndicator(pack, command) {
    if (pack.step == 0) {
        console.log(chalk.green("Creator mode activated.") + " Type /exit to exit creator mode.");
        console.log("Your pack id is: " + chalk.yellow(pack.packId));
        console.log("Press enter to continue. Type your pack name to change it.");  
    } else if (pack.step == 1 || pack.step == 2 && !command) {
        console.log("Type the number to add an element to your pack.");
        console.log("Type /exit to exit creator mode.");
        console.log(chalk.yellow("1") + " - Vehicle");
        console.log(chalk.yellow("2") + " - Trailer");
        console.log(chalk.yellow("3") + " - Armor");
        console.log(chalk.yellow("4") + " - Block");
        console.log(chalk.yellow("5") + " - Block Prop");
        console.log(chalk.yellow("6") + " - Boat");
        console.log(chalk.yellow("7") + " - Plane");
        console.log(chalk.yellow("ok") + " - Finish pack creation");
    } else if (pack.step == 2 && command) {
        if (command == "1") {
            console.log("\nType the number of the vehicle you want to add to your pack.");
            console.log("You can also put the number separated by a space or a comma to add multiple vehicles.");
            console.log("Press enter to continue. Type /exit to exit creator mode.");
        } else if (command == "2") {
            console.log("\nType the number of the trailer you want to add to your pack.");
            console.log("You can also put the number separated by a space or a comma to add multiple trailers.");
            console.log("Press enter to continue. Type /exit to exit creator mode.");
        } else if (command == "3") {
            console.log("\nType the number of the trailer you want to add to your pack.");
            console.log("You can also put the number separated by a space or a comma to add multiple armors.");
            console.log("Press enter to continue. Type /exit to exit creator mode.");
        } else if (command == "4") {
            console.log("\nType the number of the trailer you want to add to your pack.");
            console.log("You can also put the number separated by a space or a comma to add multiple blocks.");
            console.log("Press enter to continue. Type /exit to exit creator mode.");
        } else if (command == "5") {
            console.log("\nType the number of the trailer you want to add to your pack.");
            console.log("You can also put the number separated by a space or a comma to add multiple block_props.");
            console.log("Press enter to continue. Type /exit to exit creator mode.");
        } else if (command == "6") {
            console.log("\nType the number of the trailer you want to add to your pack.");
            console.log("You can also put the number separated by a space or a comma to add multiple boats.");
            console.log("Press enter to continue. Type /exit to exit creator mode.");
        } else if (command == "7") {
            console.log("\nType the number of the trailer you want to add to your pack.");
            console.log("You can also put the number separated by a space or a comma to add multiple planes.");
            console.log("Press enter to continue. Type /exit to exit creator mode.");
        }
    }
}

function packCreator(files, input, pack) {
    const command = input.trim();
    console.log({...pack, elements: pack.elements.length});
    
    if (pack.step === 0) {
        pack.packId = [...Array(6)].map(() => Math.random().toString(36).charAt(2)).join('');
        stepOutputIndicator(pack);
        pack.step++;
    } 
    /* change packId name */
    else if (pack.step === 1) {
        if (command !== "") {
            //regex to match only a-z 0-9 and no spaces
            const regex = new RegExp("^[a-zA-Z0-9]+$");
            if (command.length > 10) {
                console.log("Pack name too long. Max 10 characters.");
            } else if (command.includes(" ")) {
                console.log("Pack name cannot contain spaces.");
            } else if (command.match(regex) == null) {
                console.log("Pack name must only contain letters and numbers.");
            } else {
                console.log("New pack name: " + chalk.green(command));
                pack.packId = command;
                pack.step++;
            }
        } else {
            console.log("Pack name: " + pack.packId);
            pack.step++;
        }
        stepOutputIndicator(pack);
    }
    /* add pack element */
    else if (pack.step === 2) {
        let n = 0;
        if (command == "") {
            stepOutputIndicator(pack);
        } else if (command.toLowerCase() == "ok") {
            if (pack.elements.length == 0) {
                console.log(chalk.red("You must add at least one element to your pack."));
            } else {
                console.log(chalk.green(`You have a pack with ${pack.elements.length} elements.`));
                console.log("Do you want to have your pack protected ? " + chalk.yellow("(y/n)"));
                pack.step = 3;
            }
        }
         else if (command == "1") {
            console.log(chalk.green("Vehicle selected."));
            files.vehicle.forEach(file => {
                console.log(file.file ? chalk.yellow(n) + " - " +  file.file.split("/")[file.file.split("/").length - 1].replace("vehicle_", "").replace(".dynx", "") : chalk.yellow(n) +  " - " + file.dir.split("/")[file.dir.split("/").length - 1].replace("vehicle_", "").replace(".dynx", ""));
                n++;
            });
            stepOutputIndicator(pack, command);
            pack.step = 2.1;
        } else if (command == "2") {
            console.log(chalk.green("Trailer selected."));
            files.trailer.forEach(file => {
                console.log(file.file ? chalk.yellow(n) + " - " +  file.file.split("/")[file.file.split("/").length - 1].replace("trailer_", "").replace(".dynx", "") : chalk.yellow(n) +  " - " + file.dir.split("/")[file.dir.split("/").length - 1].replace("trailer_", "").replace(".dynx", ""));
                n++;
            });
            stepOutputIndicator(pack, command);
            pack.step = 2.2;
        } else if (command == "3") {
            console.log(chalk.green("Armor selected."));
            files.armor.forEach(file => {
                console.log(file.file ? chalk.yellow(n) + " - " +  file.file.split("/")[file.file.split("/").length - 1].replace("armor_", "").replace(".dynx", "") : chalk.yellow(n) +  " - " + file.dir.split("/")[file.dir.split("/").length - 1].replace("armor_", "").replace(".dynx", ""));
                n++;
            });
            stepOutputIndicator(pack, command);
            pack.step = 2.3;
        } else if (command == "4") {
            console.log(chalk.green("Block selected."));
            files.block.forEach(file => {
                console.log(file.file ? chalk.yellow(n) + " - " +  file.file.split("/")[file.file.split("/").length - 1].replace("block_", "").replace(".dynx", "") : chalk.yellow(n) +  " - " + file.dir.split("/")[file.dir.split("/").length - 1].replace("block_", "").replace(".dynx", ""));
                n++;
            });
            stepOutputIndicator(pack, command);
            pack.step = 2.4;
        } else if (command == "5") {
            console.log(chalk.green("Block_prop selected."));
            files.block_prop.forEach(file => {
                console.log(file.file ? chalk.yellow(n) + " - " +  file.file.split("/")[file.file.split("/").length - 1].replace("block_prop_", "").replace(".dynx", "") : chalk.yellow(n) +  " - " + file.dir.split("/")[file.dir.split("/").length - 1].replace("block_prop_", "").replace(".dynx", ""));
                n++;
            });
            stepOutputIndicator(pack, command);
            pack.step = 2.5;
        } else if (command == "6") {
            console.log(chalk.green("Boat selected."));
            files.boat.forEach(file => {
                console.log(file.file ? chalk.yellow(n) + " - " +  file.file.split("/")[file.file.split("/").length - 1].replace("boat_", "").replace(".dynx", "") : chalk.yellow(n) +  " - " + file.dir.split("/")[file.dir.split("/").length - 1].replace("boat_", "").replace(".dynx", ""));
                n++;
            });
            stepOutputIndicator(pack, command);
            pack.step = 2.6;
        } else if (command == "7") {
            console.log(chalk.green("Plane selected."));
            files.plane.forEach(file => {
                console.log(file.file ? chalk.yellow(n) + " - " +  file.file.split("/")[file.file.split("/").length - 1].replace("plane_", "").replace(".dynx", "") : chalk.yellow(n) +  " - " + file.dir.split("/")[file.dir.split("/").length - 1].replace("plane_", "").replace(".dynx", ""));
                n++;
            });
            stepOutputIndicator(pack, command);
            pack.step = 2.7;
        }
    } else if (pack.step >= 2 && pack.step < 3) {
        let type = Math.floor((pack.step % 2) * 10);
        const toAdd = command.split(/[\s,]+/);
        if (type == 1) { toAdd.forEach((e) => { pack.elements.push(files.vehicle[e]); }); }
        if (type == 2) { toAdd.forEach((e) => { pack.elements.push(files.trailer[e]); }); }
        if (type == 3) { toAdd.forEach((e) => { pack.elements.push(files.armor[e]); }); }
        if (type == 4) { toAdd.forEach((e) => { pack.elements.push(files.block[e]); }); }
        if (type == 5) { toAdd.forEach((e) => { pack.elements.push(files.block_prop[e]); }); }
        if (type == 6) { toAdd.forEach((e) => { pack.elements.push(files.boat[e]); }); }
        if (type == 7) { toAdd.forEach((e) => { pack.elements.push(files.plane[e]); }); }
        pack.step = 2;
        stepOutputIndicator(pack);
    }
    /* Generate and protect the pack */
    else if (pack.step = 3) {
        if (command.toLowerCase() == "yes" || command.toLowerCase() == "y") {
            pack.isProtected = true;
            pack.step = 3;
            console.log("Your pack is now protected.");
        } else if (command.toLowerCase() == "no" || command.toLowerCase() == "n") {
            pack.isProtected = false;
            pack.step = 3;
            console.log("Your pack is now unprotected.");
        } else {
            console.log("Do you want to protect your pack ?" + chalk.yellow(" (Yes/No)"));
        }
    }

    return pack;
}

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
                console.log('-- Help --');
                console.log('\t/help - Show this help');
                console.log('\t/pack - help for pack command');
                console.log('\t/list <type>');
            } else if (command === "/pack") {
                console.log("/pack create <name> - Create a new pack");
                console.log("/pack list - List all packs");
                console.log("/pack list <name> - List all files in a pack");
            } else if (command === "/list") {
                console.log("/list <type> - List all files of a type");
                console.log("\ttype: vehicle, trailer, armor, wheel, engine, sounds, block, block_prop, boat, plane, obj, unknown");
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
                console.log("Exiting creator mode.");
            } else {
                pack = packCreator(files, input, pack)
            }
        }
    };
      
    console.log("/help to start\n");
    
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", async (data) => {
    const input = data.trim(); // Supprimer les espaces inutiles en début et fin de l'entrée
    
    await processInput(input);
    
    process.stdout.write("\n");
    process.stdout.write("> ");
    });
    
    process.stdin.on("/exit", () => {
        process.exit(); // Quitter le processus si l'entrée est fermée
    });
    
    process.stdout.write("> ");
}