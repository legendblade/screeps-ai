// Prototype extensions:
const Traveler = require('Traveler');
require('prototypes.number')();
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
        utils.regenRoomMap();

        _.forEach(Game.rooms, (room) => room.update());

        Memory.checkSpawns = false;
    }
}