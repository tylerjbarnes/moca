import Mocadex from './mocadex.js';
import MocaError from './error.js';

class Barista {

    constructor() {
        this.lastSync = null;
        this.syncInProgress = false;
        this.syncRequested = false;
    }

    /**
     * Request export of staged mutations
     */
    requestExport() {
        if (!this.syncInProgress) {
             this.sync();
        } else {
            this.syncRequested = true;
        }
    }

    /**
     * Sync Mocadex with server
     * @return {[type]} [description]
     */
    async sync() {
        this.syncInProgress = true;
        this.lastSync = await Mocadex.getLastSync();

        mocaError = new MocaError(store.getters.user, this.lastSync);

        // push
        let pushMutations = await Mocadex.getStagedMutations();
        mocaError.setStagedMutations(pushMutations);
        if (pushMutations.length) {
            console.log('pushing');
            await hpmAPI('mutate', [pushMutations, pusher.socketId]).then(response => {
                mocaError.setPushResponse(response);
                if (!response || !response.success) throw new Error(response && response.error ? response.error : 'No response from server.');
            }).then(() => {
                mocaError.logString('Pushed staged mutations');
                Mocadex.unstageMutations(pushMutations);
                mocaError.logString('Unstaged mutations.');
                store.dispatch('setMocaSyncError', false);
            }).catch(error => {
                console.log('Failed to upload mutations. ' + error);
                mocaError.fail('push', error);
                store.dispatch('setMocaSyncError', true);
                return;
            });
        }

        // pull
        await hpmAPI('mutations', [this.lastSync]).then(async (response) => {
            if (!response || !response.mutations) throw new Error(response && response.error ? response.error : 'No response from server.');
            mocaError.setPulledMutations(response.mutations);
            await Mocadex.applyMutations(response.mutations, {shouldStage: false}).then(async () => {
                mocaError.logString('Applied mutations.');
                await this.updateSyncMeta(response.last_sync);
                mocaError.setFinalLastSync(response.last_sync);
                store.dispatch('setMocaSyncError', false);
            });
        }).catch(error => {
            console.log('Failed to download mutations. ' + error);
            mocaError.fail('pull', error);
            store.dispatch('setMocaSyncError', true);
            return;
        });

        // mocaError.fail('test', 'no error');

        if (this.syncRequested) {
            this.sync();
            this.syncRequested = false;
        } else {
            this.syncInProgress = false;
        }

    }

    /**
     * Update lastSync & appliedMutations
     * @param {string} lastSync - datetime string
     * @return {Promise}
     */
    async updateSyncMeta(lastSync) {
        await Mocadex.setLastSync(lastSync);
        // await Mocadex.flushAppliedMutations(lastSync);
    }

    retrySync() {
        let self = this;
        setTimeout(() => {
            console.log('Attempting to re-connect.');
            self.sync();
        }, 15000);
    }

}

export default new Barista();
