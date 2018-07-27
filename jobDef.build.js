module.exports = {
    build: (creep) => {
        if(!creep.memory.job.target) return true;
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