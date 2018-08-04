const log = require('log');

module.exports = {
    /**
     * Determines how many of each role should exist in the room during this stage
     * @param {Room} room The room to check
     */
    getRoleCounts: (room) => ({'x': room.harvestPoints.length + room.secondaryHarvestPoints.length}),

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
                room.setupHarvestPoints(spawn.pos);
                room.setupUpgradePoint(spawn.pos);
                room.setupCentralPoint(spawn.pos);
            } else {
                room.harvestPoints = [];
                room.secondaryHarvestPoints = [];
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