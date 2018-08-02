// The actual role
module.exports = {
    name: 'BOOT',
    getBody: () => [WORK, WORK, MOVE, CARRY],
    jobs: [
        'maintainController',
        'harvestEnergy',
        'transferEnergy'
    ],
    priority: 1,
    init: (name, memory, spawner) => {
        // TODO: assign harvest point based on other bots
    }
};