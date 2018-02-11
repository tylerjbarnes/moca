import MocaMutation from './mocaMutation.js';
import MocaFactory from './mocaFactory.js';

class MocaMutationSet {

    constructor (action, type, id, delta) {
        this.action = action;
        this.type = type;
        this.id = id;
        this.delta = delta;

        this.authorId = store.getters.user.id;
    }

    commit () {
        let mutations = [];
        switch (this.action) {
            case 'create':
                mutations = [new MocaMutation(
                    'create',
                    this.type,
                    this.id,
                    null,
                    this.delta
                )];
                if (!mutations.length) { return; }
                this.notifyProjectOfMutations(mutations);
                store.dispatch('pushMutations', mutations);
                break;
            case 'update':
                mutations = [];
                for (let propertyName of Object.keys(this.delta)) {
                    let object = store.getters.object(this.type, this.id);
                    // if (object[propertyName] != this.delta[propertyName]) {
                    if (!_.isEqual(object[propertyName], this.delta[propertyName])) {
                        mutations.push(new MocaMutation(
                            'update',
                            this.type,
                            this.id,
                            propertyName,
                            this.delta[propertyName]
                        ));
                    }
                }
                if (!mutations.length) { return; }
                this.notifyProjectOfMutations(mutations);
                store.dispatch('pushMutations', mutations);
                break;
            case 'delete':
                mutations = [new MocaMutation(
                    'delete',
                    this.type,
                    this.id,
                    null,
                    null
                )];
                if (!mutations.length) { return; }
                this.notifyProjectOfMutations(mutations);
                store.dispatch('pushMutations', mutations);
                break;
            default: return;
        }
    }

    notifyProjectOfMutations (mutations) {
        for (let mutation of mutations) {

            // Avoid Infinite Loop of Mutation Message Initating a Mutation Message
            if (mutation.object_type == 'message' && mutation.action == 'create' && mutation.property_value.type == 'mutation') { return; }

            // Avoid New Projects
            if (mutation.object_type == 'project' && mutation.action == 'create') { return; }

            // Get the Original Object & Its Old Value
            let object = store.getters.object(mutation.object_type, mutation.object_id) ?
                store.getters.object(mutation.object_type, mutation.object_id) :
                mutation.property_value;
            let oldValue = mutation.property_name ? object[mutation.property_name] : null;

            // Get the Project or Bail
            let projectId = mutation.object_type == 'project' ? object.id : object.project_id;
            if (!projectId) { return; }
            let project = mutation.object_type == 'project' ? object : store.getters.project(projectId);

            project.generateMutationMessage(mutation, oldValue);

        }
    }

}

export default MocaMutationSet;
