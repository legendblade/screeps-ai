const log = require('log');
const roles = require('roles');

module.exports = {};

/**
 * Parses the room coordinates from a given bot name
 * @param {string} name The bot's name
 */
module.exports.getRoomFor = (name) => {
    const rn = /WB[A-Z]{4}([A-Z][0-9]+[A-Z][0-9]+)S.*/.exec(name);
    return rn ? rn[1] : 'Unknown';
}

// Totally unecessary fluff; return undefined if it becomes a problem:
module.exports.generateName = (roleName, roomName) => {
    return `WB${roleName}${roomName}Sxxxxxxxx`.replace(/[x]/g, (c) => {
        return (Math.random() * 16 | 0).toString(16);
    }).toUpperCase();
}

/** 
 * @param {string} role The role name to add 
 * @param {Room} room The room to add it to
 */
module.exports.addToSpawnQueue = (role, room) => {
    console.log(`Adding ${role} to ${room.name}'s queue`);
    if (!room.spawnQueue) room.spawnQueue = [];
    room.spawnQueue.push(role);
    room.memory.spawnUpdated = true;
};

/** 
 * @param {string} role The role name to add 
 * @param {string} roomCoords The room to add it to
 */
module.exports.addToRespawnQueue = (role, roomCoords) => {
    Memory.checkSpawns = true;
};

/**
 * Returns the total cost to create the given creep
 * @param {string[]} body The items that make up the body
 */
module.exports.calcBodyCost = (body) => {
    return _.sum(body, (p) => BODYPART_COST[p]);
}

/**
 * Goes through the spawn queue and spawns as much as possible
 * @param {Room} room The room to process
 */
module.exports.processSpawnQueue = (room) => {
    if (!room || !room.spawnQueue) return;

    let energyRemaining = room.energyAvailable;
    const spawners = room.find(FIND_MY_SPAWNS, (s) => s.spawning === null);

    // console.log("Checking spawn queue: " + JSON.stringify(room.spawnQueue));

    // Only sort the list if we've updated:
    if (room.memory.spawnUpdated) {
        room.spawnQueue = _.sortBy(room.spawnQueue, (s) => (roles[s].priority || 999))
        room.memory.spawnUpdated = false;
    }

    let i = 0;
    room.spawnQueue = _.chain(room.spawnQueue)
        .dropWhile((roleName) => {
            // Only allow  
            if (spawners.length <= i++) return false;

            const role = roles[roleName];
            const body = role.getBody();
            const cost = module.exports.calcBodyCost(body);

            // If we don't have enough energy, wait until we do:
            if(energyRemaining < cost) return false;

            // Find the first spawner we can use:
            const spawner = _.find(spawners, (s) => !s.spawning);
            if (!spawner) return false;

            // Do the spawn:
            const name = module.exports.generateName(role.name, room.name);
            const mem = { role: roleName };
            if (role.init) role.init(name, mem, spawner);

            if(spawner.spawnCreep(body, name, { memory: mem }) !== OK) return false;

            // This will get overwritten by the proper value next tick
            // but would otherwise be null for the rest of this tick
            // and could cause issues
            spawner.spawning = true;
            log.info(`Started spawning new ${role.name} in ${room.name}.`);
            energyRemaining -= cost;
            return true;
        })
        .value();
}

/**
 * Goes through the dead units and determines which need
 * to be respawned. This is computationally more severe
 * as bots have to be regex'ed to determine their owning room
 * @param {Map<string, int>} existingCounts A map of roles to current counts for this room
 * @param {Room} room The room to process
 */
module.exports.processRespawnQueue = (existingCounts, room) => {
    const existingQueue = _.countBy(room.spawnQueue, (r) => (r));

    _.forEach(room.memory.roleCount, (count, roleName) =>
        _.times(count - ((existingCounts[roleName] || 0) + (existingQueue[roleName] || 0)), () => 
            module.exports.addToSpawnQueue(roleName, room)));
}

let _creepRoomMap = undefined;
module.exports.getCreepsByRoom = () => {
    if (_creepRoomMap) return _creepRoomMap;
    _creepRoomMap = _.groupBy(Game.creeps, c => c.assignedRoom);
    return _creepRoomMap;
}

module.exports.regenRoomMap = () => {
    _creepRoomMap = undefined;
}