// The actual role
module.exports = {
    name: 'HVST',
    defaultMemory: {
        'role': 'h'
    },
    getCountForRoom: function(room) {
        return 5; // Always the maximum number of containers
    },
    getBody: () => [WORK, WORK, MOVE, CARRY],
    jobs: [
        'claimMiningPoint',
        'createContainer',
        // 'repairContainer',
        'harvestEnergy',
        'transferEnergy',
        'buildRoads', // Because this thing is slow
        'upgradeController'
    ],
    priority: 1
};