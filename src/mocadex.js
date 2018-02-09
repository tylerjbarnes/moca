class Mocadex {

    /**
     * Save mutations from UI or Pusher
     * @param  {MocaMutation[]} mutations
     * @returns {Promise}
     */
    saveMutations(mutations) {
        let self = this;
        return new Promise(function(resolve, reject) {
            let savePromises = [];
            for (let mutation of mutations) {
                savePromises.push(self.saveMutation(mutation));
            }
            Promise.all(savePromises).then(() => { resolve(); });
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
     * Save mutation to IndexedDB
     * @param {mocaMutation} mutation
     * @returns {Promise}
     */
    saveMutation(mutation) {

        // typify for IndexedDB
        let typifiedVal = typifyForIdb(mutation.property_value);

        // make dexie call
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
                        .modify({[mutation.property_name]: booleanToBinary(mutation.property_value)})
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

    /**
     * Get primitive from IndexedDB
     * @param  {string} type
     * @param  {string} id
     * @promise {object} primitive
     */
    getPrimitive(type, id) {
        return new Promise(function(resolve, reject) {
            db[type + 's'].get(id).then(primitive => {resolve(primitive); });
        });
    }

}

export default new Mocadex();
