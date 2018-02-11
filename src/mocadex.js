class Mocadex {

    /**
     * Stage mutations in Mocadex
     * @param  {MocaMutation[]} mutations
     * @return {Promise}
     */
    stageMutations(mutations) {
        return new Promise(function(resolve, reject) {
            db.transaction('rw', db.stagedMutations, async () => {
                await db.stagedMutations.bulkPut(mutations);
            }).then(() => {
                resolve(mutations);
            }).catch(error => {
                reject('Failed to Stage - ' + error);
            });
        });
    }

    /**
     * Unstage mutations in Mocadex
     * @param  {MocaMutation[]} mutations
     * @return {Promise}
     */
    unstageMutations(mutations) {
        return new Promise(function(resolve, reject) {
            db.transaction('rw', db.stagedMutations, async () => {
                await db.stagedMutations.bulkDelete(mutations.map(x => x.id));
            }).then(() => {
                resolve(true);
            }).catch(error => {
                reject('Failed to Unstage - ' + error);
            });
        });
    }

    /**
     * Apply mutations to Mocadex and optionally stage
     * @param  {MocaMutation[]} mutations
     * @param  {object} config
     * @returns {Promise}
     */
    applyMutations(mutations, {shouldStage}) {
        let self = this;
        return new Promise(function(resolve, reject) {
            db.transaction('rw', db.persons, db.times, db.packages, db.resources, db.messages, db.projects,
            db.appliedMutations, db.stagedMutations, async () => {
                await Promise.all(mutations.map(x => self.applyMutation(x)));
                await self.logMutationsAsApplied(mutations);
                if (shouldStage) await self.stageMutations(mutations);
            }).then(async () => {
                let mutatedPrimitives = await Promise.all(mutations.map(x => self.getPrimitive(x.object_type, x.object_id)));
                store.dispatch('updateBuffer', {mutations, primitives: mutatedPrimitives});
                resolve();
            }).catch(error => {
                reject('Failed to Apply - ' + error);
            });
        });
    }

    /**
     * Log mutations as applied in Mocadex
     * @param  {MocaMutation[]} mutations
     * @returns {Promise}
     */
    async logMutationsAsApplied(mutations) {
        return new Promise(function(resolve, reject) {
            db.transaction('rw', db.appliedMutations, async () => {
                await db.appliedMutations.bulkPut(mutations);
            }).then(() => {
                resolve(mutations);
            }).catch(error => {
                reject('Failed to Stage - ' + error);
            });
        });
    }

    /**
     * Apply mutation to Mocadex
     * @param {mocaMutation} mutation
     * @returns {Promise}
     */
     async applyMutation(mutation) {
        if (await this.mutationAlreadyApplied(mutation)) {
            // console.log('Skipping duplicate:', mutation);
            return;
        }
        let typifiedVal = typifyForIdb(mutation.property_value);
        switch (mutation.action) {
            case 'create':
                return new Promise(function(resolve, reject) {
                    db[mutation.object_type + 's'].add(booleanToBinary(mutation.property_value))
                        .then(success => {
                            success? resolve() : console.log(new Error('Dexie create failed.'));
                        });
                });
            case 'update':
                var preparedVal = booleanToBinary(mutation.property_value);
                return new Promise(function(resolve, reject) {
                    db[mutation.object_type + 's'].where('id').equals(mutation.object_id)
                        .modify({[mutation.property_name]: preparedVal})
                        .then(success => {
                            success? resolve() : console.log(new Error('Dexie update failed.'), mutation);
                        });
                });
            case 'delete':
                store.dispatch('cleanup', mutation.object_id);
                return new Promise(function(resolve, reject) {
                    db[mutation.object_type + 's'].delete(mutation.object_id)
                        .then(() => {
                            resolve();
                        }, error => {
                            console.log(new Error('Dexie delete failed.', error));
                        });
                });
        }
    }

    /**
     * Get primitive from Mocadex
     * @param  {string} type
     * @param  {string} id
     * @promise {object} primitive
     */
    getPrimitive(type, id) {
        return new Promise(function(resolve, reject) {
            db[type + 's'].get(id).then(primitive => {resolve(primitive); });
        });
    }

    /**
     * Get Staged Mutations
     * @return {Promise}
     */
    async getStagedMutations() {
        return db.stagedMutations.toArray();
    }

    /**
     * Determine if mutation has already been applied to Mocadex
     * @param  {MocaMutation} mutation
     * @return {boolean}
     */
    async mutationAlreadyApplied(mutation) {
        return await db[mutation.object_type + 's'].get(mutation.object_id) !== undefined;
    }

    /**
     * Set lastSync marker in Mocadex
     * @param  {string}  lastSync - datetime string
     * @return {Promise}
     */
    async setLastSync(lastSync) {
        return db.ui.put({id: 'lastSync', value: lastSync});
    }

    /**
     * Get lastSync marker from Mocadex
     * @return {Promise}
     */
    async getLastSync() {
        return (await db.ui.get('lastSync')).value;
    }

    /**
     * Flush applied mutations that will not be synced down again
     * @param {string} lastSync
     * @return {Promise}
     */
    async flushAppliedMutations(lastSync) {
        var obsoleteIds = (await db.appliedMutations.filter(x => x.datetime < lastSync).toArray()).map(x => x.id);
        return db.appliedMutations.bulkDelete(obsoleteIds);
    }










    /**
     * Remove mutations from Pending Queue
     * @param  {MocaMutation[]} mutations
     * @return {Promise}
     */
    confirmMutations(mutations) {
        return new Promise(function(resolve, reject) {
            db.pendingMutations.bulkDelete(mutations.map(x => x.id)).then(() => { resolve(); });
        });
    }

    /**
     * Update Last Mutation Time
     * @param  {string} datetime
     * @return {Promise}
     */
    updateLastMutationTime(datetime) {
        return new Promise(function(resolve, reject) {
            db.ui.put({id: 'lastSync', value: datetime}).then(() => { resolve(); });
        });
    }

    /**
     * Get Last Mutation Time
     * @return {Promise}
     */
    getLastMutationTime() {
        return new Promise(function(resolve, reject) {
            db.ui.get('lastSync').then(datetime => { resolve(datetime); });
        });
    }



    /**
     * Upload mutations & download missed mutations
     */
    sync() {
        // upload mutations
        // if integrity check fails (pusher events have been missed)
        // -- rollback processing queue
        // -- download & add missing mutations to processing queue
        // -- re-apply queue
    }



    /**
     * Dispatch buffer update to Vuex
     * @param  {mocaMutation} mutation
     */
    dispatchBufferUpdate(mutation) {
        for (let bufferName in buffers) {
            let buffer = buffers[bufferName];
            if (buffer.primitiveType != mutation.object_type) continue;

            switch (mutation.action) {
                case 'create':
                case 'update':
                    buffer.shouldContain(primitive) ?
                        state.buffer[bufferName][mutation.object_id] = primitive :
                        delete state.buffer[bufferName][mutation.object_id];
                    var description = buffer.shouldContain(primitive) ? 'add/update: ' : 'remove: ';
                    description += mutation.object_id + ' for ' + bufferName;
                    console.log(description);
                    break;
                case 'delete':
                    delete state.buffer[bufferName][mutation.object_id];
                    console.log('remove: ' + mutation.object_id + ' for ' + bufferName);
                    break;
                default:
                    console.log(new Error('Impossible Case'));
            }

        }
    }



}

export default new Mocadex();
