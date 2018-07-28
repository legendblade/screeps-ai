const controllers = require('controllers');
const log = require('log');

/**
 * Recursively goes through to see if we can transition to another room this tick
 * @param {Room} room The room to check
 */
function checkTransition(room) {
    const ctrl = room.memory.ctrl;

    // A controller is a valid target if:
    // - It has custom logic from this state which returns true
    // - It has standard logic which returns true
    // - It has neither custom or standard logic and should always be transitioned into
    const transition = _.find(
        controllers[ctrl].transitions, 
        (t) => t.isValid 
            ? t.isValid(room) 
            : controllers[t.ctrl].isValid 
                ? controllers[t.ctrl].isValid(room)
                : true);
    if (!transition) return;

    // If we're transitioning to a new state:
    log.debug(`${room.name} moving from ${ctrl} to ${transition.ctrl}`);
    if(controllers[ctrl].finally) controllers[ctrl].finally(room);

    room.memory.ctrl = transition.ctrl;
    if(controllers[transition.ctrl].init) controllers[transition.ctrl].init(room);
    checkTransition(room);
}

module.exports = {
    /**
     * @param {Room} room The room to handle
     */
    handle: (room) => {
        // Start by checking if we should transition into another state:
        checkTransition(room);
        if(controllers[room.memory.ctrl].run) controllers[room.memory.ctrl].run();
    }
}