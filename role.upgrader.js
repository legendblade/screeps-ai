// The actual role
module.exports = {
    name: 'UPGD',
    defaultMemory: {
        'role': 'u'
    },
    getCountForRoom: (room) => (6),
    getBody: () => [WORK, MOVE, MOVE, CARRY],
    jobs: [
        'upgradeController',
        'collectEnergy',
        'harvestEnergy'
    ],
    priority: 10
};