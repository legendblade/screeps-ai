module.exports = {
    /** @param {Creep} creep The unit to determine if it should be doing this job */
    isValid: (creep) => {
        return creep.carry.energy < creep.carryCapacity;
    },
    /** @param {Creep} creep The unit doing the work */
    init: (creep) => {
        let target = creep.pos.findClosestByPath(FIND_SOURCES);

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

        let status = creep.harvest(target);
        if(status === ERR_NOT_IN_RANGE) {
            creep.travelTo(target);
        }

        return creep.carryCapacity <= creep.carry.energy 
            || status === ERR_NOT_ENOUGH_RESOURCES 
            || status === ERR_INVALID_TARGET;
    }
}