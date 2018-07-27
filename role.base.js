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
        const room = Game.rooms[roomCoords];
        room.memory.roleCount = getRoleCountMatrix(room);

        _.forEach(room.memory.roleCount, (count, roleName) => _.times(count, () => utils.addToSpawnQueue(roleName, room)));
    },
    updateRoom: (roomCoords) => {
        const room = Game.rooms[roomCoords];
        const newCounts = getRoleCountMatrix(room);

        // TODO: this only works right now because the spawn counts don't change:
        _(newCounts)
            .pick((count, roleName) => (room.memory.roleCount[roleName] || 0) < count)
            .forEach((count, roleName) => 
                _.times(count - (room.memory.roleCount[roleName] || 0), () => 
                    utils.addToSpawnQueue(roleName, room)
                )
            );

        room.memory.roleCount = newCounts;
    }
}