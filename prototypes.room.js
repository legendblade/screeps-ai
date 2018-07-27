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
            /**
             * @param {function} predicate Optional Filter function
             */
            get: function() {
                if (!this._constructions) this._constructions = this.find(FIND_MY_CONSTRUCTION_SITES);
                return this._constructions;
            },
            enumerable: false,
            configurable: true
        }
    });
}
