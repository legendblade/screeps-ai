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
                        // Plains roads are 300, swamp roads are 1500 to build:
                        matrix.set(s.pos.x, s.pos.y, s.progressTotal <= 300 ? 1.25 : 7.5);
                    })
                    .value();
                return matrix;
            }
        });

        // Quick and dirty hack to ensure we don't use every spot ever for roads
        if (50 <= Object.keys(Game.constructionSites).length) return;
        this.room.createConstructionSite(td.nextPos, STRUCTURE_ROAD);
    }

    Object.defineProperties(Creep.prototype, {
        'assignedRoom': {
            get: function() {
                if (this._assignedRoom) return this._assignedRoom;
                
                const rn = /WB[A-Z]{4}([A-Z][0-9]+[A-Z][0-9]+)S.*/.exec(this.name);
                this._assignedRoom = rn ? rn[1] : 'Unknown';
                return this._assignedRoom;
            },
            enumerable: false,
            configurable: true
        },
    });
}