var cacheTargetData;

module.exports = {
    /** @param {Creep} creep The unit to determine if it should be doing this job */
    isValid: (creep) => {
        if(creep.carry.energy <= 0) return false;

        let minTransfer = creep.carry.energy * 0.25;

        // Since code is synchronous, we can just store this for the init function
        cacheTargetData = creep.room.find(FIND_MY_STRUCTURES, {
            filter: (s) => {
                return (
                        s.structureType == STRUCTURE_SPAWN ||
                        s.structureType == STRUCTURE_EXTENSION ||
                        s.structureType == STRUCTURE_TOWER
                    ) && s.energy < (s.energyCapacity - minTransfer);
            }
        });

        // Only try this job if we have a target that needs energy:
        return 0 < cacheTargetData.length;
    },
    /** @param {Creep} creep The unit doing the work */
    init: (creep) => {
        let target = creep.pos.findClosestByPath(cacheTargetData);

        if(target) {
            creep.memory.job.target = target.id;
        } else {
            console.log("Unable to find target");
        }
    },
    /** @param {Creep} creep The unit doing the work */
    run: (creep) => {
        // Get the target:
        if (!creep.memory.job.target) return true;
        let target = Game.getObjectById(creep.memory.job.target);

        if(!target) return true;

        // Do the transfer:
        let status = creep.transfer(target, RESOURCE_ENERGY);
        if(status === ERR_NOT_IN_RANGE) {
            creep.travelTo(target);
        }

        // If we're out of energy, we're done with this job:
        return creep.carry.energy <= 0 || status === ERR_FULL || status === ERR_INVALID_TARGET;
    }
}