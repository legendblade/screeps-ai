const buildDef = require('jobDef.build');
var cacheTargetData;

module.exports = {
    /** @param {Creep} creep The unit to determine if it should be doing this job */
    isValid: (creep) => {
        if (creep.carry.energy < creep.carryCapacity) return false;

        // Builder will put a claim on the road object; this isn't currently persisted.
        cacheTargetData = _.filter(creep.room.constructions, (s) => s.structureType === STRUCTURE_ROAD && !s.claimed);
        return cacheTargetData.length;
    },
    /** @param {Creep} creep The unit doing the work */
    init: (creep) => {
        let target = creep.pos.findClosestByPath(cacheTargetData);

        if(target) {
            creep.memory.job.target = target.id;
            target.claimed = true;
        } else {
            console.log("Unable to find target");
        }
    },
    /** @param {Creep} creep The unit doing the work */
    run: (creep) => buildDef.build(creep)
}