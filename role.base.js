const log = require('log');
const utils = require('utils');
const roles = require('roles');
const jobEngine = require('jobEngine');

/** @param {Room} room The room to check */
function getRoleCountMatrix(room) {
    return _.mapValues(roles, (role) => role.getCountForRoom(room));
}

module.exports = {
    handle: (name) => {
        let creep = Game.creeps[name];

        // Remove dead creeps from memory:
        if (creep === undefined) {
            log.debug(`Removing dead unit: ${name}.`);
            utils.addToRespawnQueue(
                Memory.creeps[name].role, 
                utils.getRoomFor(name)
            );

            delete Memory.creeps[name];
            return;
        }

        if (creep.spawning) return;
        jobEngine.doWork(creep);
    },
    initRoom: (roomCoords) => {
        Game.rooms[roomCoords].init();
    },
    updateRoom: (roomCoords) => {
        Game.rooms[roomCoords].update();
    }
}