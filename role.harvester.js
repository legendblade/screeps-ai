// The actual role
module.exports = {
    name: 'HVST',
    defaultMemory: {
        'role': 'h'
    },
    getBody: () => [WORK, WORK, MOVE, CARRY],
    jobs: [
        'claimMiningPoint',
        'createContainer',
        // 'repairContainer',
        'harvestEnergy'
    ],
    priority: 2
};