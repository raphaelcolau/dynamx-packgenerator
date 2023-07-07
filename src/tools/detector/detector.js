import fs from 'fs';
import {  glob } from 'glob';


async function catchFiles() {
    //This function will detect all the *.dynx files in Packs folder recursively.
    //It will return an array of all the *.dynx files.
    //If the Packs folder does not exist, it will create one.

    //Check if Packs folder exists
    try {
        if (!fs.existsSync('./Packs')) {
            fs.mkdirSync('./Packs');
            console.log('Packs folder created. Put your packs in there.');
        } else {
            return glob('**/*.dynx', { cwd: './Packs' })
        }
    } catch (err) {
        console.error(err);
    }
}

function configType(file) {
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
        content: fs.readFileSync("./Packs/" + file, 'utf8'),
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

function getAllObj() {
    let obj = [];
    let files = glob('**/*.obj', { cwd: './Packs' });
    files.then(files => {
        files.forEach(async file => {
            obj.push({
                file: file.replaceAll('\\', '/'),
                dependencies: await getObjDependencies(file),
                content: fs.readFileSync("./Packs/" + file, 'utf8')
            });
        });
    }); 
    return obj;
}

async function getObjDependencies(obj) {
    let dependencies = [];
    const  lines = fs.readFileSync("./Packs/" + obj, 'utf8').split('\n');
    const dir = obj.substring(0, obj.lastIndexOf('\\')).replaceAll('\\', '/') + '/';

    for(const line of lines) {
        if (line.includes('mtllib')) {
            const mtl = line.replace('mtllib', '').replaceAll(' ', '').replaceAll('\n', '').replaceAll('\r', '')
            if (mtl.length >= 256) {
                console.log("mtl file name is too long. Skipping.");
                continue;
            } 
            const mtlContent = fs.readFileSync("./Packs/" + dir + mtl, 'utf8')
            dependencies.push({
                file: mtl,
                content: mtlContent,
            });

            //Detect textures
            const mtlLines = mtlContent.split('\n');
            mtlLines.forEach(mtlLine => {
                if (mtlLine.includes('map_Kd')) {
                    const texture = mtlLine.split(' ')[1].replaceAll('\n', '').replace('map_Kd', '').replaceAll('\r', '')
                    console.log(texture);
                    try {
                        const content = fs.readFileSync("./Packs/" + dir + texture, 'utf8')
                        dependencies.push({
                            file: texture,
                            content: content,
                        });
                    } catch (err) {
                        console.log(err);
                    }
                }
            });
        }
    };
    if (dependencies.length == 0) console.log("No dependencies found.");


    return dependencies;
}

function getCollisionFiles(dir) {
    let dependencies = [];
    const dotDC = glob('*.dc', { cwd: './Packs/' + dir });

    dotDC.then(dc => {
        dc.forEach(file => {
            dependencies.push({
                file: file,
                content: fs.readFileSync("./Packs/" + dir + file, 'utf8')
            });
        });

        return dependencies;
    });
}

export async function detector() {
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
        obj: getAllObj(),
        unknown: []
    }
    const catchAllFiles = await catchFiles().then(files => {
        files.forEach(file => {
            dynamxFiles[configType(file).type].push(configType(file));
        });
        dynamxFiles.vehicle.forEach(vehicle => {
            vehicle.dependencies = parseDependendies(vehicle);
        });
    });

    return dynamxFiles;
}