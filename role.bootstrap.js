// The actual role
module.exports = {
    name: 'BOOT',
    getBody: () => [WORK, WORK, MOVE, CARRY],
    jobs: [
        'maintainController',
        // TODO: create maintainer role
        'createContainer',
        'harvestEnergy',
        'transferEnergy'
    ],
    priority: 1,
    init: (name, memory, spawner) => {
        // Assign harvest point based on other bots
        const sourceCounts = _.chain(spawner.room.assignedCreeps)
            .filter((c) => c.memory.role === 'x')
            .countBy((c) => c.memory.source)
            .value();

        // TODO: Include available spots around sources in targeting
        memory.source = _.min(spawner.room.sources, (c) => sourceCounts[c.id] || 0).id;
    }
};