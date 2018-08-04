const roles = require('roles');
const utils = require('utils');
const controlEngine = require('controlEngine');
const controllers = require('controllers');
const bootControl = require('controller.boot'); // Special case

module.exports = () => {
    Object.defineProperties(Room.prototype, {
        'spawnQueue': {
            get: function() {
                if(!this.memory.sq) this.memory.sq = [];
                return this.memory.sq;
            },
            set: function(newValue) {
                this.memory.sq = newValue;
            },
            enumerable: true,
            configurable: true
        },
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
        },
        /**
         * Temp cache of all friendly creeps in the room
         */
        'creeps': {
            get: function() {
                if (!this._creeps) {
                    this._creeps = this.find(FIND_MY_CREEPS, {
                        filter: (s) => !s.spawning
                    });
                }
                return this._creeps;
            },
            enumerable: false,
            configurable: true
        },
        'assignedCreeps': {
            get: function() {
                return utils.getCreepsByRoom()[this.name] || {};
            },
            enumerable: false,
            configurable: false
        },
        'harvestPoints': {
            get: function() {
                return this.memory.hvstpts;
            },
            set: function(newValue) {
                this.memory.hvstpts = newValue;
            },
            enumerable: false,
            configurable: true
        },
        'secondaryHarvestPoints': {
            get: function() {
                return this.memory.shvstpts;
            },
            set: function(newValue) {
                this.memory.shvstpts = newValue;
            },
            enumerable: false,
            configurable: true
        },
        'upgradeStore': {
            get: function() {
                return this.getPositionOrStructure('u', '_upgradeStore');
            },
            set: function(newValue) {
                this.setPositionOrStructure(newValue, 'u', '_upgradeStore');
            },
            enumerable: true,
            configurable: false
        },
        'centralStore': {
            get: function() {
                return this.getPositionOrStructure('c', '_centralStore');
            },
            set: function(newValue) {
                this.setPositionOrStructure(newValue, 'c', '_centralStore');
            },
            enumerable: true,
            configurable: false
        }
    });

    /**
     * Gets a position or structure from memory or cache
     * @param {String} memIdx The memory index to retrieve from
     * @param {String} privateIdx The cache index to retrieve from
     */
    Room.prototype.getPositionOrStructure = function(memIdx, privateIdx) {
        if (this[privateIdx]) return this[privateIdx];
        if (!this.memory[memIdx]) return undefined;

        // Deserialize it:
        if (this.memory[memIdx].length <= 1) this[privateIdx] = this.getPositionFromChar(this.memory[memIdx]);
        else this[privateIdx] = Game.getObjectById(this.memory[memIdx]); 

        return this[privateIdx];
    }

    /**
     * Stores a position or structure in the given memory and cache locations.
     * @param {RoomPosition | Structure} newValue The value to store
     * @param {String} memIdx The index in memory to store the value
     * @param {String} privateIdx The index on the object to cache the value this tick
     */
    Room.prototype.setPositionOrStructure = function(newValue, memIdx, privateIdx) {
        if (!newValue) {
            delete this.memory[memIdx];
            delete this[privateIdx];
            return;
        }

        if (newValue.id) this.memory[memIdx] = newValue.id;
        else this.memory[memIdx] = this.getCharPosition(newValue);
        this[privateIdx] = newValue;
    }

    /**
     * Finds an available position in the room around a given point
     * @param {RoomPosition} pos The target position
     * @param {number} range Optional range to search in; default 1
     * @param {function} predicate An optional filter function
     * @param {number} deadZone Optional range from the center to ignore
     * @returns {RoomPosition[]} An array of room positions that are open
     */
    Room.prototype.findOpenPositionsAround = function(pos, range, predicate, deadZone) {
        range = range || 1;
        deadZone = deadZone || 0;
        if (!predicate) {
            predicate = (thing) => thing.type === 'creep';
        }

        const area = this.lookAtArea(pos.y-range, pos.x-range, pos.y+range, pos.x+range);
        const output = [];
        const min = 0-deadZone;
        const max = deadZone;
        _.forEach(area, (row, y) => {
            _.chain(row)
                .pick((s, x) => {
                    // The target square is never valid:
                    if ((pos.y - y).isBetween(min, max) && (pos.x - x).isBetween(min, max)) return false;

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
     * @param {number} deadZone Optional range from the center to ignore
     * @returns {RoomPosition} The nearest empty space, or null if one couldn't be found.
     */
    Room.prototype.findNearestOpenPositionAround = function(start, target, range, predicate, deadZone) {
        const positions = this.findOpenPositionsAround(target, range, predicate, deadZone);
        if (positions.length <= 0) return null;

        return start.findClosestByPath(positions);
    }

    Room.prototype.getRoleCountMatrix = function() {
        return controllers[this.memory.ctrl].getRoleCounts(this);
    }

    Room.prototype.init = function() {
        this.memory = {ctrl: 'boot'};
        bootControl.init(this); // This would never get called otherwise
    }

    Room.prototype.update = function() {
        if (!this.memory || !this.memory.ctrl) this.init();

        // Deal with updating role counts:
        const newCounts = this.getRoleCountMatrix();
        if(!Memory.checkSpawns && !this.memory.roleCount || _.find(newCounts, (c, r) => (this.memory.roleCount[r] || 0) < c)) {
            Memory.checkSpawns = true;
        }
        this.memory.roleCount = newCounts;

        // Handle spawn queue
        if (Memory.checkSpawns) {
            const botCounts = this.assignedCreeps;
            utils.processRespawnQueue(botCounts ? _.countBy(botCounts, (c) => c.memory.role) : {}, this);
        }
        // TODO: consider wrapping this into the room itself instead of utils
        utils.processSpawnQueue(this);

        controlEngine.handle(this);
    }

    /**
     * Encodes an internal position
     * @param {RoomPosition} pos The position to encode
     * @returns {String} The encoded position
     */
    Room.prototype.getCharPosition = function(pos) {
        if (pos.pos) pos = pos.pos;
        return (pos.x && pos.y) ? String.fromCharCode(pos.x + (pos.y << 6)) : '';
    }

    /**
     * Decodes a char internal position to a RoomPosition
     * @param {String} char The character encoded position
     * @returns {RoomPosition} The position in this room
     */
    Room.prototype.getPositionFromChar = function(char) {
        if (char === '') return undefined;
        const unencode = char.charCodeAt();
        return new RoomPosition(unencode & 0x3F, unencode >> 6, this.name);
    }

    /**
     * Plans for a construction at the given point.
     * @param {RoomPosition} pos The position to plan at
     * @param {String} type The type of construction
     * @param {number} priority The priority to take care of this construction at.
     */
    Room.prototype.planConstruction = function(pos, type, priority, name) {
        priority = priority || 50;
        // TODO: implement actual construction queue
        this.createConstructionSite(pos, type, name);
    }

    /**
     * Sets up main and secondary harvest points near the initial position
     * @param {RoomPosition} pos The spawn or entry position
     */
    Room.prototype.setupHarvestPoints = function(pos) {
        // TODO: Prioritize existing container?
        _.forEach(this.sources, (s) => {
            // Find all our points:
            const points = this.findOpenPositionsAround(s.pos, 1, () => false);
            if (points.length <= 0) return;

            // Find the nearest one:
            const point = pos.findClosestByPath(points);
            if(!point) point = points[0];

            // Deal with the primary point:
            this.planConstruction(point, STRUCTURE_CONTAINER, 1)
            room.harvestPoints.push(this.getCharPosition(point));

            // Now deal with the other spots:
            _.forEach(points, (p) => {
                if(p.isEqualTo(point)) return;
                this.secondaryHarvestPoints.push(this.getCharPosition(p));
            });
        });
    }

    /**
     * Sets up upgrade point
     * @param {RoomPosition} pos The spawn or entry position
     */
    Room.prototype.setupUpgradePoint = function(pos) {
        // Find spots that are at at a range of 3 from the controller
        const point = pos.findClosestByPath(
            this.findOpenPositionsAround(this.controller.pos, 3, () => false, 2)
        );

        this.planConstruction(point, STRUCTURE_CONTAINER, 1)
        this.upgradeStore = this.getCharPosition(point);
    }

    /**
     * Sets up the central storage point
     * @param {RoomPosition} pos The spawn or entry position
     */
    Room.prototype.setupCentralPoint = function(pos) {
        // ? Should this possibly be planned based on distance from other points?
        const point = new RoomPosition(pos.x, pos.y + 1, this.name);
        this.planConstruction(point, STRUCTURE_CONTAINER, 1)
        this.centralStore = this.getCharPosition(point);
    }
}
