module.exports = {
    /** @param {Creep} creep The unit to determine if it should be doing this job */
    isValid: (creep) => {
        if (creep.carryCapacity <= creep.carry.energy || creep.room.spawnQueue.length) return false;

        cacheTargetData = creep.room.find(FIND_MY_STRUCTURES, {
            filter: (s) => {
                return (
                        s.structureType == STRUCTURE_SPAWN ||
                        s.structureType == STRUCTURE_EXTENSION
                    ) && (s.energyCapacity * 0.8) <= s.energy;
            }
        });

        return 0 < cacheTargetData.length;
    },
    /** @param {Creep} creep The unit doing the work */
    init: (creep) => {
        creep.memory.job.target = creep.pos.findClosestByPath(cacheTargetData).id;
    },
    /** @param {Creep} creep The unit doing the work */
    run: (creep) => {
        // Get the target:
        if (!creep.memory.job.target) return true;
        let target = Game.getObjectById(creep.memory.job.target);

        if(!target) return true;

        let status = creep.withdraw(
            target, 
            RESOURCE_ENERGY, 
            Math.min(target.energy, creep.carryCapacity - creep.carry.energy)
        );
        if(status === ERR_NOT_IN_RANGE) {
            creep.travelTo(target);
        }

        return creep.carryCapacity <= creep.carry.energy 
            || status === ERR_FULL 
            || status === ERR_INVALID_TARGET;
    }
}