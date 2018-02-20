import Mocadex from './mocadex.js';

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

        // push
        let pushMutations = await Mocadex.getStagedMutations();
        if (pushMutations.length) {
            console.log('pushing');
            await hpmAPI('mutate', [pushMutations, pusher.socketId]).then(response => {
                if (!response || !response.success) throw new Error(response && response.error ? response.error : 'No response from server.');
            }).then(() => {
                Mocadex.unstageMutations(pushMutations);
                store.dispatch('setMocaSyncError', false);
            }).catch(error => {
                console.log('Failed to upload mutations. ' + error);
                hpmAPI('log_error', [{user: store.getters.user.name, action: 'push', mutations: pushMutations, error}])
                // this.retrySync();
                store.dispatch('setMocaSyncError', true);
                return;
            });
        }

        // pull
        await hpmAPI('mutations', [this.lastSync]).then(async (response) => {
            if (!response || !response.mutations) throw new Error(response && response.error ? response.error : 'No response from server.');
            await Mocadex.applyMutations(response.mutations, {shouldStage: false}).then(async () =>{
                await this.updateSyncMeta(response.last_sync);
                store.dispatch('setMocaSyncError', false);
            });
        }).catch(error => {
            console.log('Failed to download mutations. ' + error);
            hpmAPI('log_error', [{user: store.getters.user.name, action: 'pull', error: error}])
            // this.retrySync();
            store.dispatch('setMocaSyncError', true);
            return;
        });

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
