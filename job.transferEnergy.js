var cacheTargetData;

module.exports = {
    /** @param {Creep} creep The unit to determine if it should be doing this job */
    isValid: (creep) => {
        if(creep.carry.energy <= 0) return false;

        let minTransfer = creep.carry.energy * 0.25;

        // Since code is synchronous, we can just store this for the init function
        cacheTargetData = creep.room.find(FIND_STRUCTURES, {
            filter: (s) => {
                return s.energy < (s.energyCapacity - minTransfer) && 
                    s.structureType == STRUCTURE_SPAWN ||
                    s.structureType == STRUCTURE_EXTENSION ||
                    s.structureType == STRUCTURE_TOWER;
            }
        });

        // Only try this job if we have a target that needs energy:
        return 0 < cacheTargetData.length;
    },
    /** @param {Creep} creep The unit doing the work */
    init: (creep) => {
        // Get all positions around the target structures:
        let goals = _.map(cacheTargetData, (s) => ({ pos: s.pos, range: 1}));

        // TODO: Refactor this out, cache cost matrix
        let ret = PathFinder.search(
            creep.pos,
            cacheTargetData,
            {
                plainCost: 2,
                swampCost: 10,
                maxRooms: 2,

                // Borrowed currently from the API docs:
                roomCallback: (roomName) => {
                    let room = Game.rooms[roomName];
                    if (!room) return;

                    // TODO: Cache this!
                    let costs = new PathFinder.CostMatrix;
            
                    room.find(FIND_STRUCTURES).forEach((struct) => {
                        if (struct.structureType === STRUCTURE_ROAD) {
                            // Favor roads over plain tiles
                            costs.set(struct.pos.x, struct.pos.y, 1);
                        } else if (
                            struct.structureType !== STRUCTURE_CONTAINER &&
                                (struct.structureType !== STRUCTURE_RAMPART || !struct.my)
                            ) 
                        {
                            // Can't walk through non-walkable buildings
                            costs.set(struct.pos.x, struct.pos.y, 0xff);
                        }
                    });
            
                    // Avoid creeps in the room
                    room.find(FIND_CREEPS).forEach((creep) => {
                        costs.set(creep.pos.x, creep.pos.y, 0xff);
                    });
            
                    return costs;
                }
            }
        )

        // TODO: actually store and use path
        creep.memory.job.move = _.last(ret.path);
        console.log(JSON.stringify(ret));
        let target = _.find(cacheTargetData, (s) => s.pos.isNearTo(creep.memory.job.move));
        if(target) {
            creep.memory.job.target = target.id;
        } else {
            console.log("Had path, but no target at destination?");
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
            creep.moveTo(target);
        }

        // If we're out of energy, we're done with this job:
        return creep.carry.energy <= 0 || status === ERR_FULL || status === ERR_INVALID_TARGET;
    }
}