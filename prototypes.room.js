require('prototypes.structure');

module.exports = () => {
    Object.defineProperties(Room.prototype, {
        /**
         * Used to cache source data for faster lookup at the expense of memory.
         */
        'sources': {
            get: function() {
                if (this._sources) return this._sources;

                // This bit could be further optimized, but since it's only ever called
                // the very first time we get a room, it doesn't matter as much:
                if (!this.memory.sourceIds) {
                    this.memory.sourceIds = _.map(this.find(FIND_SOURCES), source => source.id);
                }

                // Get the source objects from the id's in memory and store them locally
                this._sources = _.map(this.memory.sourceIds, id => Game.getObjectById(id));
                return this._sources;
            },
            set: function(newValue) {
                // Update memory as well as the local cache:
                this.memory.sources = _.map(newValue, source => source.id);
                this._sources = newValue;
            },
            enumerable: false,
            configurable: true
        },
        /**
         * Temp cache of construction projects; only guaranteed cached this tick.
         */
        'constructions': {
            get: function() {
                if (!this._constructions) this._constructions = this.find(FIND_MY_CONSTRUCTION_SITES);
                return this._constructions;
            },
            enumerable: false,
            configurable: true
        },
        /**
         * Temp cache of basic sites needing repairs; only guaranteed cached this tick.
         */
        'basicRepairs': {
            get: function() {
                if (!this._basicRepairs) {
                    this._basicRepairs = this.find(FIND_STRUCTURES, {
                        filter: (s) => {
                            // TODO: expand this list:
                            return s.hits <= (s.hitsMax * 0.75) &&
                                s.structureType === STRUCTURE_ROAD;
                        }
                    });
                }
                return this._basicRepairs;
            },
            enumerable: false,
            configurable: true
        }
    });

    /**
     * Finds an available position in the room around a given point
     * @param {RoomPosition} pos The target position
     * @param {number} range Optional range to search in; default 1
     * @param {function} predicate An optional filter function
     * @returns {RoomPosition[]} An array of room positions that are open
     */
    Room.prototype.findOpenPositionsAround = function(pos, range, predicate) {
        range = range || 1;
        if (!predicate) {
            predicate = (thing) => thing.type === 'creep';
        }

        const area = this.lookAtArea(pos.y-range, pos.x-range, pos.y+range, pos.x+range);
        const output = [];
        _.forEach(area, (row, y) => {
            _.chain(row)
                .pick((s, x) => {
                    // The target square is never valid:
                    if (y === pos.y && x === pos.x) return false;

                    // Find the first impassible thing in this spot:
                    return !_.find(s, (thing) => {
                        // These are a few of my impassible things...
                        return (thing.type === 'terrain' && thing.terrain === 'wall') ||
                            (thing.type === 'structure' && !thing.structure.passable) ||
                            predicate(thing);
                    });
                })
                .forEach((s, x) => {
                    output.push(new RoomPosition(x, y, this.name));
                })
                .run();
        });

        return output;
    }

    /**
     * Find the nearest position from the start around the target
     * @param {RoomPosition} start The start area to find the nearest spot from
     * @param {RoomPosition} target The target area to find a position near
     * @param {int} range Optional range to search in from the target; default 1
     * @param {function} predicate Optional search predicate; defaults to squares not containing bots.
     * @returns {RoomPosition} The nearest empty space, or null if one couldn't be found.
     */
    Room.prototype.findNearestOpenPositionAround = function(start, target, range, predicate) {
        const positions = this.findOpenPositionsAround(target, range, predicate);
        if (positions.length <= 0) return null;

        return start.findClosestByPath(positions);
    }
}
