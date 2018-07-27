module.exports = () => {
    Object.defineProperties(Structure.prototype, {
        'passable': {
            get: function() {
                if (this.structureType === STRUCTURE_ROAD) return true;
                return this.my && (
                    this.structureType === STRUCTURE_CONTAINER ||
                    this.structureType === STRUCTURE_RAMPART
                );
            },
            enumerable: false,
            configurable: true
        }
    });
}