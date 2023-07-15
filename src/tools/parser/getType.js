
// return the type of dynamx file
export function getType(file) {
    return (() => {
        if (typeof file === "object") return "file";
        if (file.startsWith("vehicle_")) return       "vehicle";
        if (file.startsWith("trailer_")) return       "trailer";
        if (file.startsWith("armor_")) return         "armor";
        if (file.startsWith("wheel_")) return         "wheel";
        if (file.startsWith("engine_")) return        "engine";
        if (file.startsWith("sounds_")) return        "sounds";
        if (file.startsWith("block_")) return         "block";
        if (file.startsWith("block_prop_")) return    "block_prop";
        if (file.startsWith("boat_")) return          "boat";
        if (file.startsWith("plane_")) return         "plane";
        if (file.startsWith("obj/")) return           "obj";
        return "unknown";
    })()
}