module.exports = () => {
    Creep.prototype.travelAndQueueRoad = function(target, range) {
        range = range || 1;
        let td = {};
        this.travelTo(target, {
            returnData: td,
            range: range,
            roomCallback: (roomName, matrix) => {
                const room = Game.rooms[roomName];
                if (!room) return undefined; // Use default matrix

                // Make sure we're at least attempting to travel across existing plans:
                _.chain(room.constructions)
                    .filter((s) => s.structureType === STRUCTURE_ROAD)
                    .forEach((s) => {
                        matrix.set(s.pos.x, s.pos.y, 1.25);
                    })
                    .value();
                return matrix;
            }
        });

        // We don't really care if this fails or not:
        this.room.createConstructionSite(td.nextPos, STRUCTURE_ROAD);
    }
}