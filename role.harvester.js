// The actual role
module.exports = {
    name: 'HVST',
    defaultMemory: {
        'role': 'h'
    },
    getBody: () => [WORK, WORK, MOVE, CARRY],
    jobs: [
        // 'repairContainer',
        'harvestEnergy',
        'transferEnergy' // ? Should this ever do this?
    ],
    priority: 2
};