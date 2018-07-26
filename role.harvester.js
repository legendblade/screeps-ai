// The actual role
module.exports = {
    name: 'HVST',
    defaultMemory: {
        'role': 'h'
    },
    getCountForRoom: function(room) {
        //console.log(room);
        // TODO: calculate based on energy node count
        return 6;
    },
    getBody: () => [WORK, WORK, MOVE, CARRY],
    jobs: [
        'transferEnergy',
        'harvestEnergy'
    ]
};