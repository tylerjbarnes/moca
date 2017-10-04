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

}

export default Resource;
