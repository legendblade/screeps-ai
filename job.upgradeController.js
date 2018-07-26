var cacheTargetData;

module.exports = {
    /** @param {Creep} creep The unit to determine if it should be doing this job */
    isValid: (creep) => {
        return creep.carryCapacity <= creep.carry.energy && creep.room.controller.my;
    },
    /** @param {Creep} creep The unit doing the work */
    run: (creep) => {
        // Do the transfer:
        let status = creep.upgradeController(creep.room.controller);
        if(status === ERR_NOT_IN_RANGE) {
            creep.travelTo(creep.room.controller, { range: 3 });
        }

        // If we're out of energy, we're done with this job:
        return creep.carry.energy <= 0 || status === ERR_NOT_ENOUGH_RESOURCES || status === ERR_INVALID_TARGET;
    }
}