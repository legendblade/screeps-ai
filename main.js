const log = require('log');
const utils = require('utils');

const roles = {
    'h': {
        name: 'HVST',
        controller: require('role.harvester'),
    }
};

module.exports.loop = function () {
    // See if we need to spawn more of a role:
    if (Game.time % 10 === 0) {
        for (let roleName in roles) {
            let role = roles[roleName];
            log.debug(`Checking spawns for ${roleName}...`);

            for (let roomCoords in Game.rooms) {
                let room = Game.rooms[roomCoords];
                let shouldSpawn = role.controller.shouldSpawn(room);
                log.debug(`  -> ${roomCoords}: ${shouldSpawn}`);
                if (0 < shouldSpawn) utils.spawnInRoom(room, shouldSpawn, role);
            }
        }
    }

    // Run creep code:
    for(let name in Game.creeps) {
        let creep = Game.creeps[name];
        
        if (creep.spawning) continue;

        let role = roles[creep.memory.role];
        log.debug(`Running ${role.name} on ${creep.name}...`);
        role.controller.run(creep);
    }
}