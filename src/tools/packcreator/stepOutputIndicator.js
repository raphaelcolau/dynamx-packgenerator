const chalk = require("chalk");

exports.stepOutputIndicator = function stepOutputIndicator(pack, command) {
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
        console.log(chalk.yellow("8") + " - Helicopter");
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
            console.log("\nType the number of the plane you want to add to your pack.");
            console.log("You can also put the number separated by a space or a comma to add multiple planes.");
            console.log("Press enter to continue. Type /exit to exit creator mode.");
        } else if (command == "8") {
            console.log("\nType the number of the helicopter you want to add to your pack.");
            console.log("You can also put the number separated by a space ou une virgule pour ajouter plusieurs hélicoptères.");
            console.log("Press enter to continue. Type /exit to exit creator mode.");
        }
    }
}
