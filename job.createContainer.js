const buildDef = require('jobDef.build');
let cacheTargetData;

module.exports = {
    /** @param {Creep} creep The unit to determine if it should be doing this job */
    isValid: (creep) => {
        if (
            creep.carry.energy < creep.carryCapacity || 
            creep.room.spawnQueue.length || 
            creep.room.energyAvailable < 300
        ) {
            return false;
        }

        // TODO: Calculate current energy going into construction:
        cacheTargetData = creep.pos.findClosestByPath(
                _.filter(
                    creep.room.constructions, 
                    (c) => c.structureType === STRUCTURE_CONTAINER
                )
            );
        return cacheTargetData;
    },
    init: (creep) => {
        creep.memory.job.target = cacheTargetData.id;
    },
    /** @param {Creep} creep The unit doing the work */
    run: (creep) => buildDef.build(creep)
}