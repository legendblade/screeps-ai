const log = require('log');

function generateName(roleName, spawner) {
    return `WB-${roleName}-${spawner.substring(5)}-xxxxxxxx`.replace(/[x]/g, (c) => {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    }).toUpperCase();
}

module.exports = {
    // Totally unecessary fluff; return undefined if it becomes a problem:
    generateName: generateName,
    spawnInRoom: function(room, count, role) {
        // Find not-in-use spawners:
        const body = role.controller.getBody();
        
        const spawners = room.find(FIND_MY_SPAWNS, {
            filter: (s) => {
                return s.spawning === null && s.spawnCreep(body, 'test', { dryRun: true }) === OK;
            }
        });
        
        let toSpawn = Math.min(count, spawners.length);
        
        for(let i = 0; i < toSpawn; i++) {
            let spawner = spawners[i];
            log.debug(
                spawner.spawnCreep(body, generateName(role.name, spawner.name), {
                    memory: _.cloneDeep(role.controller.defaultMemory)
                })
            );
        }
    }
};