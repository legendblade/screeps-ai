// Prototype extensions:
const Traveler = require('Traveler');
require('prototypes.creep')();
require('prototypes.structure')();
require('prototypes.room')();

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
        // Handle room inits:
        if (!Memory.rooms) Memory.rooms = {};

        const botRoleCounts = Memory.checkSpawns ? _.chain(Game.creeps)
            .groupBy(c => utils.getRoomFor(c.name))
            .mapValues(r => _.countBy(r, (c) => c.memory.role))
            .value() : {};

        for (let roomCoords in Game.rooms) {
            if (!Memory.rooms[roomCoords]) {
                log.info(`Initializing new room at ${roomCoords}`);
                Memory.rooms[roomCoords] = {};
                roleBase.initRoom(roomCoords);
            } else {
                roleBase.updateRoom(roomCoords);
            }

            // Handle spawn queue
            const room = Game.rooms[roomCoords];
            if (Memory.checkSpawns) utils.processRespawnQueue(botRoleCounts[roomCoords], room);
            utils.processSpawnQueue(room);
        }

        Memory.checkSpawns = false;
    }
}