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

        // TODO: some of this logic will need to move when we start remote harvesting.
        if(_.isEmpty(room.harvestPoints)) {
            const spawn = _.first(room.find(FIND_MY_SPAWNS));

            if (spawn) {
                room.harvestPoints = _.map(room.sources, (s) => {
                    // While this is less elegant than chaining a forEach, it requires less
                    // computational power, as there'd need to be multiple loops and map calls otherwise.
                    const point = room.findNearestOpenPositionAround(spawn.pos, s.pos, 1, () => false);
                    if(!point) return '';

                    room.planConstruction(point, STRUCTURE_CONTAINER, 1)
                    return room.getCharPosition(point);
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