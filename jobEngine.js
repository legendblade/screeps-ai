const JOBS = require('jobs');
const ROLES = require('roles');

const log = require('log');

module.exports = {
    doWork: (creep) => {
        // If we need a new job, figure out which one it is:
        let jobName = creep.memory.job && creep.memory.job.name;
        let job = undefined;
        if (!jobName) {
            let role = ROLES[creep.memory.role];
            jobName = _.find(
                role.jobs,
                (job) => {
                    return JOBS[job].isValid(creep);
                }
            );

            if (!jobName) {
                //log.debug(`${creep.name} is idle.`);
                return;
            }

            log.info(`${creep.name} now performing ${jobName}`)
            creep.memory.job = { name: jobName };
            job = JOBS[jobName];

            if (job.init) job.init(creep);
        } else {
            job = JOBS[jobName];
        }

        // Perform our current job
        if(!job || job.run(creep)) delete creep.memory.job;
    }
}