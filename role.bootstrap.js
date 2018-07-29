// The actual role
module.exports = {
    name: 'BOOT',
    defaultMemory: {
        'role': 'x'
    },
    getBody: () => [WORK, WORK, MOVE, CARRY],
    jobs: [
        'harvestEnergy',
        'transferEnergy',
        'upgradeController'
    ],
    priority: 1
};