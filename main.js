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
        // Handle room inits:
        if (!Memory.rooms) Memory.rooms = {};

        const botRoleCounts = Memory.checkSpawns ? _.chain(Game.creeps)
            .groupBy(c => utils.getRoomFor(c.name))
            .pick((data, r) => Memory.rooms[r] && Memory.rooms[r].next && Memory.rooms[r].next <= Game.time)
            .mapValues(r => _.countBy(r, (c) => c.memory.role))
            .value() : {};

        for (let roomCoords in Game.rooms) {
            // Don't re-init the room here, otherwise we're going to just spawn a billion of them again...
            if (Memory.rooms[roomCoords] && Memory.rooms[roomCoords].next && Memory.rooms[roomCoords].next <= Game.time) {
                roleBase.updateRoom(roomCoords);

                // Handle spawn queue
                const room = Game.rooms[roomCoords];
                utils.processSpawnQueue(room);
                if (Memory.checkSpawns) utils.processRespawnQueue(botRoleCounts[roomCoords], room);
                Memory.rooms[roomCoords].next = Game.time + 5;
            }
            if (Memory.rooms[roomCoords]) continue;

            log.info(`Initializing new room at ${roomCoords}`);
            Memory.rooms[roomCoords] = {next: Game.time + 5};
            roleBase.initRoom(roomCoords);
        }

        Memory.checkSpawns = false;
    }
}