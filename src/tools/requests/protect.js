const chalk = require("chalk");
const axios = require("axios");
const path = require("path");
const fs = require("fs");
const { Blob } = require("node:buffer");
const FormData = require("form-data");

exports.protectPack = function protectPack(fileDirectory, host, game_dir, packId) {
    const apiAddress = host;
    const fileBuffer = fs.createReadStream(fileDirectory);
    const fileName = path.basename(fileDirectory);
    const file = new Blob([fileBuffer], { type: "application/zip" });

    console.log(file);

    const formData = new FormData();
    formData.append("pack_file", fileBuffer, fileName);
    formData.append("game_dir", game_dir);
    formData.append("rep_id", packId);

    console.log("Host: " + chalk.magenta(`https://${apiAddress}/mprotector/packs/zip`));

    axios.post(`https://${apiAddress}/mprotector/packs/zip`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }).then((response) => {
        if (response.data.dl_link) {
            console.log(chalk.green("Pack created: ") + response.data.dl_link);
        }
    }).catch((error) => {
        if (error.response.data) {
            console.log(chalk.red("Error: ") + error.response.data);
        } else {
            console.log(error);
        }
    });

}