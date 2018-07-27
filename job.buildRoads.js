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
            console.log(`Builder claiming ${target.id}`)
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

        let status = creep.build(target);
        if(status === ERR_NOT_IN_RANGE) {
            creep.travelTo(target, { range: 3 });
        }

        return creep.carry.energy <= 0
            || status === ERR_NOT_ENOUGH_RESOURCES 
            || status === ERR_INVALID_TARGET;
    }
}