const log = require('log');
const roles = require('roles');

module.exports = {};

// Totally unecessary fluff; return undefined if it becomes a problem:
module.exports.generateName = (roleName, roomName) => {
    return `WB${roleName}${roomName}Sxxxxxxxx`.replace(/[x]/g, (c) => {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    }).toUpperCase();
}

module.exports.spawnInRoom = (room, role) => {
    if (room === undefined) {
        log.info("Unable to spawn new bot due to invalid room.");
        return true;
    }

    // Find not-in-use spawners:
    const body = role.controller.getBody();
    
    const spawners = room.find(FIND_MY_SPAWNS, {
        filter: (s) => {
            return s.spawning === null && s.spawnCreep(body, 'test', { dryRun: true }) === OK;
        }
    });
    
    let spawner = spawners[0];
    if(spawner === undefined) return false;

    return spawner.spawnCreep(body, module.exports.generateName(role.name, room.name), {
            memory: _.cloneDeep(role.controller.defaultMemory)
        }) === OK;
}

module.exports.addToSpawnQueue = (role, room) => {
    if (!Memory.spawnQueue) Memory.spawnQueue = [];
    Memory.spawnQueue.push({role: role, room: room});
};

module.exports.processSpawnQueue = () => {
    if (!Memory.spawnQueue) return;
    _.remove(Memory.spawnQueue, (q) => {
        let retVal = module.exports.spawnInRoom(
            q.room.name ? Game.rooms[q.room.name] : Game.rooms[q.room], 
            roles[q.role]
        );

        if (retVal) log.info(`Started spawning new ${q.role} in ${q.room}.`);
        return retVal;
    });
}
