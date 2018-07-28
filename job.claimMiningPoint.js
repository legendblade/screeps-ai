const utils = require('utils');

let cacheTargetData;
let cacheSource;

module.exports = {
    /** @param {Creep} creep The unit to determine if it should be doing this job */
    isValid: (creep) => {
        if (creep.memory.spot) return false;

        // TODO: Prioritize any space near a source with a container already.

        const otherHarvesters = _.filter(utils.getCreepsByRoom()[creep.room.name] || [], (c) => c.memory.role === 'h');

        // Find the first available source...
        cacheSource = _.find(creep.room.sources, (s) => {
            const spots = creep.room.findOpenPositionsAround(s.pos, 1);
            if(spots.length <= 0) return false;

            // ... which has a spot that isn't claimed by another harvester...
            _.remove(spots, (s) => {
                return _.find(otherHarvesters, (h) => h.memory.spot == s);
            });
            if(spots.length <= 0) return false;

            // Boil it down to the nearest one:
            if (spots.length === 1) {
                cacheTargetData = spots[0];
                return true;
            }

            cacheTargetData = creep.pos.findClosestByPath(spots);
            return cacheTargetData !== null;
        });

        return cacheTargetData && cacheSource;
    },
    /** @param {Creep} creep The unit doing the work */
    init: (creep) => {
        creep.memory.spot = cacheTargetData;
        creep.memory.source = cacheSource.id;
    },
    /** @param {Creep} creep The unit doing the work */
    run: (creep) => true
}