const fs = require('fs');
const {glob} = require('glob');
const chalk = require("chalk");
const path = require('path');


async function catchFiles(directory) {
    //This function will detect all the *.dynx files in Packs folder recursively.
    //It will return an array of all the *.dynx files.
    //If the Packs folder does not exist, it will create one.

    //Check if Packs folder exists
    const dir = path.join(directory, '/Packs/');
    try {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
            console.log('Packs folder created. Put your packs in there.');
        } else {
            return glob('**/*.dynx', { cwd: dir })
        }
    } catch (err) {
        console.error(err);
    }
}

function configType(file, directory) {
    const dir = path.join(directory, '/Packs/');

    return {
        type: (() => {
            if (file.includes('vehicle_')) return 'vehicle';
            else if (file.includes('trailer_')) return 'trailer';
            else if (file.includes('armor_')) return 'armor';
            else if (file.includes('wheel_')) return 'wheel';
            else if (file.includes('engine_')) return 'engine';
            else if (file.includes('sounds_')) return 'sounds';
            else if (file.includes('block_prop_')) return 'block_prop';
            else if (file.includes('block_')) return 'block';
            else if (file.includes('boat_')) return 'boat';
            else if (file.includes('helicopter_')) return 'helicopter';
            else if (file.includes('plane_')) return 'plane';
            else return 'unknown';
        })(),
        name: file.substring(file.lastIndexOf('\\') + 1, file.lastIndexOf('.dynx')),
        dir: file.replaceAll("\\", "/"),
        content: fs.readFileSync(dir + file, 'utf8'),
        dependencies: [],
    }
}

function parseDependendies(file) {
    let dependencies = [];
    let lines = file.content.split('\r\n');

    lines.forEach(line => {
        const truncline = line.replaceAll('\t', '');
        if (truncline.startsWith('Model')) {
            const obj = truncline.replace('Model:', '').replaceAll(' ', '')
            if (!dependencies.includes(obj)) dependencies.push(obj);
        } else if (truncline.startsWith('DefaultEngine')) {
            const engine = truncline.replace('DefaultEngine:', '').replaceAll(' ', '').split('.')[1];
            if (!dependencies.includes(engine)) dependencies.push(engine);
        } else if (truncline.startsWith('DefaultSounds')) {
            const sounds = truncline.replace('DefaultSounds:', '').replaceAll(' ', '').split('.')[1];
            if (!dependencies.includes(sounds)) dependencies.push(sounds);
        } else if (truncline.includes('AttachedWheel')) {
            const wheel = truncline.replace('AttachedWheel:', '').replaceAll(' ', '').split('.')[1];
            if (!dependencies.includes(wheel)) dependencies.push(wheel);
        }
    });

    return dependencies;
}

async function getAllObj(directory) {
    const dir = path.join(directory, '/Packs/');
    let obj = [];
    let files = await glob('**/*.obj', { cwd: dir });

    const promises = files.map(async file => {
      const dependencies = await getObjDependencies(file, directory);
      return {
        file: file.replaceAll('\\', '/'),
        dependencies: dependencies,
        content: fs.readFileSync(dir + file, 'utf8')
      };
    });
    obj = await Promise.all(promises);
  
    return obj;
}

async function getObjDependencies(obj, directory) {
    let dependencies = [];
    const packDir = path.join(directory, '/Packs/');
    const lines = fs.readFileSync(packDir + obj, 'utf8').split('\n');
    const dir = obj.substring(0, obj.lastIndexOf('\\')).replaceAll('\\', '/') + '/';

    for(const line of lines) {
        if (line.includes('mtllib')) {
            const mtl = line.replace('mtllib', '').replaceAll(' ', '').replaceAll('\n', '').replaceAll('\r', '')
            if (mtl.length >= 256) {
                console.log("mtl file name is too long. Skipping.");
                continue;
            } 
            try {
                const mtlContent = fs.readFileSync(packDir + dir + mtl, 'utf8')
                dependencies.push({
                    file: dir + mtl,
                    content: mtlContent,
                    type: 'text'
                });

                //Detect textures
                const mtlLines = mtlContent.split('\n');
                mtlLines.forEach(mtlLine => {
                    if (mtlLine.includes('map_Kd')) {
                        const texture = mtlLine.split(' ')[1].replaceAll('\n', '').replace('map_Kd', '').replaceAll('\r', '')
                        try {

                            const content = fs.readFileSync(packDir + dir + texture)
                            dependencies.push({
                                file: dir + texture,
                                content: content,
                                type: 'image'
                            });

                        } catch (err) {
                            console.log(chalk.red("[ERROR] ") + chalk.yellow(err.code) + ":" + err.path);
                        }
                    }
                });

            } catch (err) {
                console.log(chalk.red("[ERROR] ") + chalk.yellow(err.code) + ": " + err.path);
            }

        }
    };
    if (dependencies.length == 0) console.log("No dependencies found.");

    const collisionFiles = await getCollisionFiles(dir, directory);

    return dependencies.concat(collisionFiles);
}

function getCollisionFiles(dir, directory) {
    const packDir = path.join(directory, '/Packs/');
    const dc = glob('*.dc', { cwd: packDir + dir });
  
    return dc.then(files => {
      const promises = files.map(file => {
        return new Promise((resolve, reject) => {
          fs.readFile(packDir + dir + file, 'utf8', (err, content) => {
            if (err) {
              reject(err);
              return;
            }
            
            const dependency = {
              file: dir + file,
              content: content,
              type: 'text'
            };
            resolve(dependency);
          });
        });
      });
  
      return Promise.all(promises);
    });
}

function parseSoundDependendies(file, directory) {
    const dir = path.join(directory, '/Packs/');
    const lines = file.content.split('\n');
    let dependencies = [];
    
    // Extraire le nom du pack depuis le chemin du fichier
    const pathParts = file.dir.split('/');
    const pack = pathParts.length > 0 ? pathParts[0] : '';

    lines.forEach(line => {
        if (line.includes('Sound:')) {
            const parts = line.trim().split(' ');
            if (parts.length > 1) {
                const soundName = parts[1].replaceAll('\n', '').replaceAll('\r', '');
                // Vérifier que le nom du son n'est pas vide
                if (soundName && soundName.trim() !== '') {
                    const sound = soundName + ".ogg";
                    if (!dependencies.includes(sound)) {
                        try {
                            dependencies.push({
                                file: pack + "/assets/dynamxmod/sounds/" + sound,
                                content: fs.readFileSync(dir + pack + "/assets/dynamxmod/sounds/" + sound),
                                type: 'audio'
                            });
                        } catch (err) {
                            console.log(chalk.red("[ERROR] ") + chalk.yellow(err.code) + ": " + err.path);
                        }
                    }
                }
            }
        }
    });

    return dependencies;
}

exports.detector = async function detector(directory) {
    let dynamxFiles = {
        vehicle: [],
        trailer: [],
        armor: [],
        wheel: [],
        engine: [],
        sounds: [],
        block_prop: [],
        block: [],
        boat: [],
        helicopter: [],
        plane: [],
        obj: await getAllObj(directory),
        unknown: [],
        total: 0,
    }

    const catchAllFiles = await catchFiles(directory).then(files => {
        if (files.length == 0) {
            console.log("No files found.");
            return;
        }
        //Put all files in their respective arrays
        files.forEach(file => {
            dynamxFiles[configType(file, directory).type].push(configType(file, directory));
        });

        //Parse all dependencies for vehicle files
        dynamxFiles.vehicle.forEach(vehicle => {
            vehicle.dependencies = parseDependendies(vehicle);
        });

        //Parse all dependencies for trailer files
        dynamxFiles.trailer.forEach(trailer => {
            trailer.dependencies = parseDependendies(trailer);
        });

        //Parse all dependencies for armor files
        dynamxFiles.armor.forEach(armor => {
            armor.dependencies = parseDependendies(armor);
        });

        //Parse all dependencies for wheel files
        dynamxFiles.wheel.forEach(wheel => {
            wheel.dependencies = parseDependendies(wheel);
        });

        //Parse all dependencies for block_prop files
        dynamxFiles.block_prop.forEach(block_prop => {
            block_prop.dependencies = parseDependendies(block_prop);
        });

        //Parse all dependencies for block files
        dynamxFiles.block.forEach(block => {
            block.dependencies = parseDependendies(block);
        });

        //Parse all dependencies for boat files
        dynamxFiles.boat.forEach(boat => {
            boat.dependencies = parseDependendies(boat);
        });

        //Parse all dependencies for helicopter files
        dynamxFiles.helicopter.forEach(helicopter => {
            helicopter.dependencies = parseDependendies(helicopter);
        });

        //Parse all dependencies for plane files
        dynamxFiles.plane.forEach(plane => {
            plane.dependencies = parseDependendies(plane);
        });

        //Parse all dependencies for sounds files
        dynamxFiles.sounds.forEach(sounds => {
            sounds.dependencies = parseSoundDependendies(sounds, directory);
        });

    });

    parsedFilesNumber(dynamxFiles);

    return dynamxFiles;
}

function parsedFilesNumber(parsedFiles) {
    let total = 0;
    for (const key in parsedFiles) {
        if (key == "total") continue;
        total += parsedFiles[key].length;
    }

    console.log("Parsed files:");
    console.log("\tVehicle: " + chalk.yellow(parsedFiles.vehicle.length));
    console.log("\tTrailer: " + chalk.yellow(parsedFiles.trailer.length));
    console.log("\tArmor: " + chalk.yellow(parsedFiles.armor.length));
    console.log("\tWheel: " + chalk.yellow(parsedFiles.wheel.length));
    console.log("\tEngine: " + chalk.yellow(parsedFiles.engine.length));
    console.log("\tSounds: " + chalk.yellow(parsedFiles.sounds.length));
    console.log("\tBlock Prop: " + chalk.yellow(parsedFiles.block_prop.length));
    console.log("\tBlock: " + chalk.yellow(parsedFiles.block.length));
    console.log("\tBoat: " + chalk.yellow(parsedFiles.boat.length));
    console.log("\tHelicopter: " + chalk.yellow(parsedFiles.helicopter.length));
    console.log("\tPlane: " + chalk.yellow(parsedFiles.plane.length));
    console.log("\tObj: " + chalk.yellow(parsedFiles.obj.length));
    console.log("\tUnknown: " + chalk.yellow(parsedFiles.unknown.length));
    console.log("Total: " + chalk.yellow(total));

    return total;
}

exports.parsedFilesNumber = parsedFilesNumber;

//TODO: Add sounds for klaxon, horn, siren etc.