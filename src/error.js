import Mocadex from './mocadex.js';

class MocaError {

    constructor(user, lastSync) {
        this.user = user;
        this.originalLastSync = lastSync;

        this.logStrings = ['Starting sync for ' + user.name + ' with last sync: ' + lastSync];
    }

    logString(string) {
        this.logStrings.push(string);
    }

    setStagedMutations (stagedMutations) {
        this.stagedMutations = stagedMutations;
        this.logString('Found ' + stagedMutations.length + ' staged mutations.');
    }

    setPulledMutations (pulledMutations) {
        this.pulledMutations = pulledMutations;
        this.logString('Pulled ' + pulledMutations.length + ' mutations.');
    }

    setFinalLastSync(lastSync) {
        this.finalLastSync = lastSync;
        this.logString('Updated last sync to ' + lastSync);
    }

    fail (processName, innerError) {
        this.failedProcess = processName;
        this.innerError = innerError;
        this.logString('Failed during ' + processName + ' with error: ' + innerError);
        hpmAPI('log_error', [
            {
                log: this.logStrings,
                details: {
                    user: this.user,
                    userAgent: navigator.userAgent,
                    originalLastSync: this.originalLastSync,
                    finalLastSync: this.finalLastSync,
                    stagedMutations: this.stagedMutations,
                    pulledMutations: this.pulledMutations,
                    failedProcess: this.failedProcess,
                    innerError: this.innerError
                }
            }
        ]);
    }

}

export default MocaError;
