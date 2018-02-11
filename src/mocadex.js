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
    async applyMutations(mutations, {shouldStage}) {
        let self = this;
        await self.gainObjects(mutations);
        return new Promise(function(resolve, reject) {
            db.transaction('rw', db.persons, db.times, db.packages, db.resources, db.messages, db.projects,
            db.appliedMutations, db.stagedMutations, async () => {
                let appliedMutationIds = (await Promise.all(mutations.map(x => self.applyMutation(x)))).filter(x => x !== undefined);
                await self.logMutationsAsApplied(mutations);
                if (shouldStage) await self.stageMutations(mutations);
                return appliedMutationIds;
            }).then(async (appliedMutationIds) => {
                let appliedMutations = mutations.filter(x => appliedMutationIds.includes(x.id));
                let mutatedPrimitives = await Promise.all(appliedMutations.map(x => self.getPrimitive(x.object_type, x.object_id)));
                store.dispatch('updateBuffer', {mutations: appliedMutations, primitives: mutatedPrimitives});
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
            return;
        }
        let typifiedVal = typifyForIdb(mutation.property_value);
        switch (mutation.action) {
            case 'create':
                await db[mutation.object_type + 's'].add(booleanToBinary(mutation.property_value));
                return mutation.id;
            case 'update':
                var preparedVal = booleanToBinary(mutation.property_value);
                await db[mutation.object_type + 's'].where('id').equals(mutation.object_id)
                    .modify({[mutation.property_name]: preparedVal});
                return mutation.id;
            case 'delete':
                store.dispatch('cleanup', mutation.object_id);
                await db[mutation.object_type + 's'].delete(mutation.object_id);
                return mutation.id;
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
        return await db.appliedMutations.get(mutation.id) !== undefined;
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
     * Remove all objects from Mocadex
     * @return {Promise}
     */
    async clearData() {
        return new Promise(function(resolve, reject) {
            db.transaction('rw', db.persons, db.times, db.packages, db.resources, db.messages, db.projects, async () => {
                await Promise.all([
                    'messages',
                    'packages',
                    'persons',
                    'projects',
                    'resources',
                    'times'
                ].map(x => { db[x].clear(); } ));
            }).then(() => {
                resolve(true);
            }).catch(error => {
                reject('Failed to Clear Data - ' + error);
            });
        });
    }

    /**
     * Delete Mocadex
     */
    uninstall() {
        db.delete();
    }

    /**
     * Add objects to Mocadex
     * @param  {object}  data - dictionary by table
     * @return {Promise}
     */
    async addObjects(data) {
        return new Promise(function(resolve, reject) {
            db.transaction('rw', db.persons, db.times, db.packages, db.resources, db.messages, db.projects, async () => {
                return Promise.all([
                    'messages',
                    'packages',
                    'persons',
                    'projects',
                    'resources',
                    'times'
                ].filter(x => data[x] && data[x].length).map(x => { db[x].bulkAdd(data[x]); } ));
            }).then(() => {
                resolve(true);
            }).catch(error => {
                reject('Failed to Add Objects - ' + error);
            });
        });
    }

    /**
     * Dispatch store action to download object dependents
     * @param  {MocaMutation[]}  mutations
     * @return {Promise}
     */
    async gainObjects(mutations) {
        for (let mutation of mutations) {
            if (await this.mutationAlreadyApplied(mutation)) {
                continue;
            }
            if (
                mutation.action == 'update' &&
                mutation.object_type == 'project' &&
                mutation.property_name == 'contractor_id' &&
                mutation.property_value == store.getters.user.id
            ) {
                store.dispatch('gainProject', mutation.object_id);
            }
        }
    }







    // /**
    //  * Remove mutations from Pending Queue
    //  * @param  {MocaMutation[]} mutations
    //  * @return {Promise}
    //  */
    // confirmMutations(mutations) {
    //     return new Promise(function(resolve, reject) {
    //         db.pendingMutations.bulkDelete(mutations.map(x => x.id)).then(() => { resolve(); });
    //     });
    // }
    //
    // /**
    //  * Update Last Mutation Time
    //  * @param  {string} datetime
    //  * @return {Promise}
    //  */
    // updateLastMutationTime(datetime) {
    //     return new Promise(function(resolve, reject) {
    //         db.ui.put({id: 'lastSync', value: datetime}).then(() => { resolve(); });
    //     });
    // }
    //
    // /**
    //  * Get Last Mutation Time
    //  * @return {Promise}
    //  */
    // getLastMutationTime() {
    //     return new Promise(function(resolve, reject) {
    //         db.ui.get('lastSync').then(datetime => { resolve(datetime); });
    //     });
    // }
    //
    //
    //
    // /**
    //  * Upload mutations & download missed mutations
    //  */
    // sync() {
    //     // upload mutations
    //     // if integrity check fails (pusher events have been missed)
    //     // -- rollback processing queue
    //     // -- download & add missing mutations to processing queue
    //     // -- re-apply queue
    // }
    //
    //
    //
    // /**
    //  * Dispatch buffer update to Vuex
    //  * @param  {mocaMutation} mutation
    //  */
    // dispatchBufferUpdate(mutation) {
    //     for (let bufferName in buffers) {
    //         let buffer = buffers[bufferName];
    //         if (buffer.primitiveType != mutation.object_type) continue;
    //
    //         switch (mutation.action) {
    //             case 'create':
    //             case 'update':
    //                 buffer.shouldContain(primitive) ?
    //                     state.buffer[bufferName][mutation.object_id] = primitive :
    //                     delete state.buffer[bufferName][mutation.object_id];
    //                 var description = buffer.shouldContain(primitive) ? 'add/update: ' : 'remove: ';
    //                 description += mutation.object_id + ' for ' + bufferName;
    //                 console.log(description);
    //                 break;
    //             case 'delete':
    //                 delete state.buffer[bufferName][mutation.object_id];
    //                 console.log('remove: ' + mutation.object_id + ' for ' + bufferName);
    //                 break;
    //             default:
    //                 console.log(new Error('Impossible Case'));
    //         }
    //
    //     }
    // }



}

export default new Mocadex();
