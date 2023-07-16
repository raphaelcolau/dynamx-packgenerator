const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

exports.appDirectory = function createPackManagerDirectory() {
    let appDataDir;
    if (process.platform === 'win32') {
      appDataDir = process.env.APPDATA;
    } else if (process.platform === 'darwin') {
      appDataDir = path.join(process.env.HOME, 'Library', 'Application Support');
    } else {
      appDataDir = process.env.HOME;
    }
  
    const packManagerDir = path.join(appDataDir, 'PackManager');
  
    if (!fs.existsSync(packManagerDir)) {
      try {
        fs.mkdirSync(packManagerDir, { recursive: true });
        console.log(chalk.green("Folder created: ") + packManagerDir);
      } catch (error) {
        console.log(chalk.red("Error: ") + "An error occurred while creating the PackManager folder:");
        console.log(error);
      }
    } else {
      console.log(chalk.green("Folder detected: ") + packManagerDir);
    }

    return packManagerDir;
}