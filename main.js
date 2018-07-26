// Prototype extensions:
const Traveler = require('Traveler');

// The rest of the owl:
const log = require('log');
const utils = require('utils');
const roleBase = require('role.base');

module.exports.loop = function () {
    // Run creep code; use Game.memory so we can clean up
    // any creeps that are dead. Creeps will always be in
    // memory (or I've messed up their spawn code)
    for(let name in Memory.creeps) {
        roleBase.handle(name);
    }

    if (Game.time % 10 == 0) {
        // Handle spawn queue
        utils.processSpawnQueue();

        // Handle room inits:
        if (!Memory.rooms) Memory.rooms = {};
        for (let roomCoords in Game.rooms) {
            if (Memory.rooms[roomCoords]) continue;

            log.info(`Initializing new room at ${roomCoords}`);
            Memory.rooms[roomCoords] = {};
            roleBase.initRoom(roomCoords);
        }
    }
}