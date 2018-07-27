// The actual role
module.exports = {
    name: 'BLDR',
    defaultMemory: {
        'role': 'b'
    },
    getCountForRoom: (room) => Math.ceil(room.constructions.length / 10),
    getBody: () => [WORK, MOVE, MOVE, CARRY, CARRY],
    jobs: [
        'repairBasic',
        'buildRoads',
        'collectEnergy',
        'upgradeController',
        'harvestEnergy'
    ],
    priority: 20
};