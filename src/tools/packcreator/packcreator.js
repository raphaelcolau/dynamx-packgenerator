const chalk = require("chalk");
const { generatePack } = require('./generatePack.js');
const { stepOutputIndicator } = require('./stepOutputIndicator.js');

exports.packCreator = function packCreator(files, input, pack) {
    const command = input.trim();
    
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
        let type = Math.round((pack.step - 2) * 10);
        const toAdd = command.split(/[\s,]+/);

        if (type == 1) { toAdd.forEach((e) => { pack.elements.indexOf(files.vehicle[e]) === -1 ? pack.elements.push(files.vehicle[e]) : null }); }
        if (type == 2) { toAdd.forEach((e) => { pack.elements.indexOf(files.trailer[e]) === -1 ? pack.elements.push(files.trailer[e]) : null }); }
        if (type == 3) { toAdd.forEach((e) => { pack.elements.indexOf(files.armor[e]) === -1 ? pack.elements.push(files.armor[e]) : null }); }
        if (type == 4) { toAdd.forEach((e) => { pack.elements.indexOf(files.block[e]) === -1 ? pack.elements.push(files.block[e]) : null }); }
        if (type == 5) { toAdd.forEach((e) => { pack.elements.indexOf(files.block_prop[e]) === -1 ? pack.elements.push(files.block_prop[e]) : null }); }
        if (type == 6) { toAdd.forEach((e) => { pack.elements.indexOf(files.boat[e]) === -1 ? pack.elements.push(files.boat[e]) : null }); }
        if (type == 7) { toAdd.forEach((e) => { pack.elements.indexOf(files.plane[e]) === -1 ? pack.elements.push(files.plane[e]) : null }); }
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
        generatePack(files, pack);
    }

    return pack;
}