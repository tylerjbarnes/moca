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
                let createMutations = mutations.filter(x => x.action == 'create');
                let updateMutations = mutations.filter(x => x.action == 'update');
                let deleteMutations = mutations.filter(x => x.action == 'delete');
                let appliedCreateIds = (await Promise.all(createMutations.map(x => self.applyMutation(x)))).filter(x => x !== undefined);
                let appliedUpdateIds = (await Promise.all(updateMutations.map(x => self.applyMutation(x)))).filter(x => x !== undefined);
                let appliedDeleteIds = (await Promise.all(deleteMutations.map(x => self.applyMutation(x)))).filter(x => x !== undefined);
                let appliedMutationIds = [...appliedCreateIds, ...appliedUpdateIds, ...appliedDeleteIds];
                await self.logMutationsAsApplied(mutations);
                if (shouldStage) await self.stageMutations(mutations);
                return appliedMutationIds;
            }).then(async (appliedMutationIds) => {
                let appliedMutations = mutations.filter(x => appliedMutationIds.includes(x.id));
                let mutatedPrimitives = await Promise.all(appliedMutations.map(x => self.getPrimitive(x.object_type, x.object_id)));
                store.dispatch('updateBuffer', {mutations: appliedMutations, primitives: mutatedPrimitives});
                resolve();
            }).catch(error => {
                reject('Failed to Apply - ' + error + ' - ' + mutations.map(x => x.id).join());
            });
        });
    }

    /**
     * Log mutations as applied in Mocadex
     * @param  {MocaMutation[]} mutations
     * @returns {Promise}
     */
    async logMutationsAsApplied(mutations) {
        await db.transaction('rw', db.appliedMutations, async () => {
            await db.appliedMutations.bulkPut(mutations);
        });
    }

    /**
     * Apply mutation to Mocadex
     * @param {mocaMutation} mutation
     * @returns {Promise}
     */
     async applyMutation(mutation) {
        mocaError.logString('Attempting to apply ' + mutation.id + '(' + mutation.action + ' ' + mutation.object_type + ' ' + mutation.object_id + ')');
        if (await this.mutationAlreadyApplied(mutation)) {
            return;
        }
        let typifiedVal = typifyForIdb(mutation.property_value);
        switch (mutation.action) {
            case 'create':
                await db[mutation.object_type + 's'].add(typifiedVal);
                return mutation.id;
            case 'update':
                await db[mutation.object_type + 's'].where('id').equals(mutation.object_id)
                    .modify({[mutation.property_name]: typifiedVal});
                return mutation.id;
            case 'delete':
                await store.dispatch('cleanup', {type: mutation.object_type, id: mutation.object_id});
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
        await indexedDB.deleteDatabase('mocadex');
        // await db.transaction('rw', db.persons, db.times, db.packages, db.resources, db.messages, db.projects, async () => {
        //     await Promise.all([
        //         'messages',
        //         'packages',
        //         'persons',
        //         'projects',
        //         'resources',
        //         'times'
        //     ].map(x => { db[x].clear(); } ));
        // });
    }

    /**
     * Delete Mocadex
     */
    async uninstall() {
        await db.delete();
    }

    /**
     * Add objects to Mocadex
     * @param  {object}  data - dictionary by table
     * @return {Promise}
     */
    async addObjects(data) {
        await db.transaction('rw', db.persons, db.times, db.packages, db.resources, db.messages, db.projects, async () => {
            await Promise.all([
                'messages',
                'packages',
                'persons',
                'projects',
                'resources',
                'times'
            ].filter(x => data[x] && data[x].length).map(x => { db[x].bulkAdd(data[x]); } ));
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

}

export default new Mocadex();
