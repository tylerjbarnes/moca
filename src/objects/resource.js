import MocaObject from './mocaObject.js';
class Resource extends MocaObject {

    get author () {
        return store.getters.person(this.author_id);
    }

    get lastEditor () {
        return store.getters.person(this.last_editor_id);
    }

    get project () {
        return store.getters.project(this.project_id);
    }

    cleanUp() {

        // Mutation Messages
        let markedMessageIds = store.getters.mutationMessagesForObject(this.id).map(message => message.id);
        store.state.messages = store.state.messages.filter(
            message => !markedMessageIds.includes(message.id)
        );

    }

}

export default Resource;
