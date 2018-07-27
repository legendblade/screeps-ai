const buildDef = require('jobDef.build');
let cacheTargetData;

/**
 * Gets the object ID at the given position
 * @param {Room} room The room to check in
 * @param {RoomPosition} pos The object ID
 * @returns {string} The ID
 */
function getConstructionId(room, pos) {
    const site = room.lookForAt(LOOK_CONSTRUCTION_SITES, pos);
    return site && site.constructionSite && site.constructionSite.id;
}

module.exports = {
    /** @param {Creep} creep The unit to determine if it should be doing this job */
    isValid: (creep) => {
        if (!creep.memory.spot || creep.carry.energy < creep.carryCapacity) return false;

        if (creep.memory.container) {
            // Make sure it's still a valid container:
            const container = Game.getObjectById(creep.memory.container);
            if (container !== undefined) return false;
            delete creep.memory.container
        }

        // Try to build at the site:
        const spot = new RoomPosition(creep.memory.spot.x, creep.memory.spot.y, creep.memory.spot.roomName);
        const status = creep.room.createConstructionSite(spot, STRUCTURE_CONTAINER);
        // console.log(status + ' @ ' + JSON.stringify(creep.memory.spot));
        if (status === OK) {
            // Since we don't create the construction until the end of this turn
            // there's no way to get the ID. The build will fail immediately, but
            // will generally trigger this to happen again.
            return true;
        } else if(status !== ERR_INVALID_TARGET) {
            // We can't do it for some reason; full queue perhaps?
            // if it's ERR_RCL_NOT_ENOUGH, we can't 'ever'
            return false;
        }

        // Do we have something at our spot?
        const thing = _.find(creep.room.lookAt(spot), (s) => {
            return (s.type === LOOK_STRUCTURES && s.structure.structureType === STRUCTURE_CONTAINER) || s.type === LOOK_CONSTRUCTION_SITES
        });

        // If we got here without a structure, just die:
        if (!thing) return false;

        if (thing.type === LOOK_CONSTRUCTION_SITES) {
            // If there's already a container being built there: finish it.
            if (thing.constructionSite.structureType === STRUCTURE_CONTAINER) {
                cacheTargetData = thing.constructionSite.id;
                return true;
            }

            // Otherwise, cancel it, we need a container here:
            thing.constructionSite.remove();
        } else if(thing.type === LOOK_STRUCTURES) {
            creep.memory.container = thing.structure.id;
            // We don't need to build it if it's built
            return false;
        }

        // Regardless of what we did above, we won't be able to rebuild this tick anyway.
        return false;
    },
    init: (creep) => {
        creep.memory.job.target = cacheTargetData;
    },
    /** @param {Creep} creep The unit doing the work */
    run: (creep) => buildDef.build(creep)
    // If the container was constructed, the creep will pick it up proper the next time it checks this job.
}