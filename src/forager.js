import localForage from 'localforage';

class Forager {

    constructor () {

        this.instances = {};

        for (let type of [
            'setting',
            'message',
            'package',
            'person',
            'project',
            'resource',
            'time'
        ]) {
            this.instances[type] = localForage.createInstance({
                name: 'moca',
                storeName: type + 's'
            });
        }

    }

    setObject(type, key, value) {
        return this.instances[type].setItem(key, value);
    }

    getObject(type, key) {
        return this.instances[type].getItem(key);
    }

    removeObject(type, key) {
        return this.instances[type].removeItem(key);
    }

    mutateObject(mutation) {
        console.log(mutation);
        switch (mutation.action) {
            case 'create':
                this.setObject(mutation.object_type, mutation.object_id, mutation.property_value);
                break;
            case 'update':
                this.getObject(mutation.object_type, mutation.object_id).then(object => {
                    object[mutation.property_name] = mutation.property_value;
                    this.setObject(mutation.object_type, mutation.object_id, object);
                });
                break;
            case 'delete':
                this.removeObject(mutation.object_type, mutation.object_id);
                break;
            default: return;
        }
    }

    setLastMutationId(mutationId) {
        return this.instances['setting'].setItem('last_mutation_id', mutationId);
    }

    exists() {
        let me = this;
        return new Promise(function(resolve, reject) {
            me.instances['person'].length().then(length => { resolve(length > 0); });
        });
    }

    stateOfType(type) {
        let me = this;
        return new Promise(function(resolve, reject) {
            me.instances[type].keys().then(keys => {
                let promises = [];
                let objects = [];
                me.instances[type].iterate((value, key, i) => {
                    promises.push(new Promise(function(resolve, reject) {
                        me.getObject(type, key).then((object) => {
                            objects.push(object);
                            resolve();
                        });
                    }));
                }).then(() => {
                    Promise.all(promises).then(() => {
                        me.state[type + 's'] = objects;
                        resolve();
                    });
                });
            });

        });
    }

    reset() {
        for (let type of [
            'setting',
            'message',
            'package',
            'person',
            'project',
            'resource',
            'time'
        ]) {
            this.instances[type].clear();
        }
    }

    getState() {
        let me = this;
        me.state = {};
        return new Promise(function(resolve, reject) {

            var state = {};
            var promises = [];
            let outerIterationPromise = null;

            for (let type of [
                'message',
                'package',
                'person',
                'project',
                'resource',
                'time'
            ]) {
                promises.push(me.stateOfType(type));
            }
            promises.push(me.instances['setting'].getItem('last_mutation_id').then(mutationId => {
                me.state.last_mutation_id = mutationId;
            }));

            Promise.all(promises).then(() => {
                resolve(me.state);
            });

        });

    }

}

var forager = new Forager();

export default forager;
