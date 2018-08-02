const log = require('log');

module.exports = {
    /**
     * Determines how many of each role should exist in the room during this stage
     * @param {Room} room The room to check
     */
    getRoleCounts: (room) => ({'x': room.sources.length * 3}),

    /**
     * Called when first entering this stage
     * @param {Room} room The room
     */
    init: (room) => {
        log.info(`Initializing new room at ${room.name}`);

        if(!room.harvestPoints) {
            const spawn = _.first(room.find(FIND_MY_SPAWNS));

            if (spawn) {
                room.harvestPoints = _.map(room.sources, (s) => {
                    return room.getCharPosition(
                        room.findNearestOpenPositionAround(spawn.pos, s.pos, 1, () => false)
                    );
                });
            } else {
                room.harvestPoints = [];
            }
        }
    },

    /**
     * Called to update the room
     * @param {Room} room The room
     */
    run: (room) => {

    },

    /**
     * Called when leaving this stage
     * @param {Room} room The room
     */
    finally: (room) => {

    },

    /**
     * Define potential role transitions here
     */
    transitions: [

    ]
}