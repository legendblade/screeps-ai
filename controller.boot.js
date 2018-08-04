const log = require('log');

module.exports = {
    /**
     * Determines how many of each role should exist in the room during this stage
     * @param {Room} room The room to check
     * TODO: This should be based on the number of available spots around sources, not just assuming 3.
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
                const main = [];
                const secondary = [];
                _.forEach(room.sources, (s) => {
                    // Find all our points:
                    const points = room.findOpenPositionsAround(s.pos, 1, () => false);
                    if (points.length <= 0) return;

                    // Find the nearest one:
                    const point = spawn.findClosestByPath(points);
                    if(!point) point = points[0];

                    // Deal with the primary point:
                    room.planConstruction(point, STRUCTURE_CONTAINER, 1)
                    main.push(room.getCharPosition(point));

                    // Now deal with the other spots:
                    _.forEach(points, (p) => {
                        if(p.isEqualTo(point)) return;
                        secondary.push(room.getCharPosition(p));
                    });
                });

                room.harvestPoints = main;
                room.secondaryHarvestPoints = secondary;
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