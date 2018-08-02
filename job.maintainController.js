const upgradeController = require('job.upgradeController');

module.exports = {
    /** @param {Creep} creep The unit to determine if it should be doing this job */
    isValid: (creep) => {
        return creep.carryCapacity <= creep.carry.energy 
            && creep.room.controller.my
            && creep.room.controller.ticksToDowngrade <= 500;
    },
    /** @param {Creep} creep The unit doing the work */
    run: (creep) => upgradeController.run(creep)
}