const log = require('log');
const utils = require('utils');
const roles = require('roles');

module.exports = {
    handle: (name) => {
        let creep = Game.creeps[name];

        // Remove dead creeps from memory:
        if (creep === undefined) {
            log.debug(`Removing dead unit: ${name}.`);
            // TODO: Add to spawn queue

            let roomName = /WB[A-Z]{4}([A-Z][0-9]+[A-Z][0-9]+)S.*/.exec(name);
            if (roomName != undefined) {
                utils.addToSpawnQueue(
                    Memory.creeps[name].role, 
                    roomName[1]
                );
            }

            delete Memory.creeps[name];
            return;
        }

        if (creep.spawning) return;

        let role = roles[creep.memory.role];
        // log.debug(`Running ${role.name} on ${creep.name}...`);
        role.controller.run(creep);
    },
    initRoom: (roomCoords) => {
        let room = Game.rooms[roomCoords];
        room.memory.roleCount = {};

        for (let roleName in roles) {
            let role = roles[roleName];
            let shouldSpawn = role.controller.getCountForRoom(room);
            log.debug(`  -> ${role.name}: ${shouldSpawn}`);
            room.memory.roleCount[roleName] = shouldSpawn;
            if (0 < shouldSpawn) _.times(shouldSpawn, () => utils.addToSpawnQueue(roleName, roomCoords));
        }
    }
}