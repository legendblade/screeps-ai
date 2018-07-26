const JOBS = require('jobs');
const ROLES = require('roles');

const log = require('log');

module.exports = {
    doWork: (creep) => {
        // If we need a new job, figure out which one it is:
        let jobName = creep.memory.job;
        if (!jobName) {
            let role = ROLES[creep.memory.role];
            creep.memory.job = jobName = _.find(
                role.jobs,
                (job) => {
                    return JOBS[job].isValid(creep);
                }
            );
            log.info(`${creep.name} now performing ${jobName}`)
        }

        // Perform our current job
        let job = JOBS[jobName];

        // log.debug(`Running ${jobName} on ${creep.name}...`);
        if(job.run(creep)) delete creep.memory.job;
    }
}