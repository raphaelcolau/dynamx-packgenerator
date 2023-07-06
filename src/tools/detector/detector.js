import { dir } from 'console';
import fs from 'fs';
import { Glob, glob } from 'glob';


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
            if (file.includes('pack_info')) return 'pack_info';
            else if (file.includes('vehicle_')) return 'vehicle';
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
        dir: file.replace("\\", "/"),
        content: fs.readFileSync("./Packs/" + file, 'utf8'),
    }
}

export async function detector() {
    let files = await catchFiles();
    files.forEach(file => {
        console.log(configType(file));
    });
    return await catchFiles();
}