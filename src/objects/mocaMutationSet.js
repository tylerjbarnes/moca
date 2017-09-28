import MocaMutation from './mocaMutation.js';

class MocaMutationSet {

    constructor (action, type, id, delta) {
        this.action = action;
        this.type = type;
        this.id = id;
        this.delta = delta;

        this.authorId = store.state.user.id;
    }

    commit () {
        switch (this.action) {
            case 'create':
                store.dispatch('exportMutations', [new MocaMutation(
                    'create',
                    this.type,
                    this.id,
                    null,
                    this.delta
                )]);
                break;
            case 'update':
                var mutations = [];
                for (let propertyName of Object.keys(this.delta)) {
                    let object = store.getters.object(this.type, this.id);
                    if (object[propertyName] !== this.delta.propertyName) {
                        mutations.push(new MocaMutation(
                            'update',
                            this.type,
                            this.id,
                            propertyName,
                            this.delta[propertyName]
                        ));
                    }
                }
                store.dispatch('exportMutations', mutations);
                break;
            case 'delete':
                store.dispatch('exportMutations', [new MocaMutation(
                    'delete',
                    this.type,
                    this.id,
                    null,
                    null
                )]);
                break;
            default: return;
        }
    }

}

export default MocaMutationSet;
