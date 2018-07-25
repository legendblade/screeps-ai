// Utils
function findEmptySource(room) {
    return room.find(FIND_SOURCES, {
        filter: (s) => {
            let contents = s.room.lookAtArea(s.pos.y-1, s.pos.x-1, s.pos.y+1, s.pos.x+1);

            
        }
    });
}

// State map
const states = {
    'd': function(creep) {
        let sources = creep.room.find(FIND_SOURCES);
        
    },
    'h': function(creep) {
        
    }
};

// The actual role
module.exports = {
    defaultMemory: {
        'role': 'h',
        'state': 'd'
    },
    getCountForRoom: function(room) {
        //console.log(room);
        // TODO: calculate based on energy node count
        return 6;
    },
    getBody: () => [WORK, WORK, MOVE, CARRY],
    run: function(creep) {
        if (creep.carry.energy < creep.carryCapacity) {
            let sources = creep.room.find(FIND_SOURCES);
            
            if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(sources[0]);
            }
        } else {
            if(creep.transfer(Game.spawns['Spawn1'], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.spawns['Spawn1']);
            }            
        }
    }  
};