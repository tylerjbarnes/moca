class Project {

    constructor (projectPrimitive) {
        Object.assign(this, projectPrimitive);
    }

    get client () {
        return this.client_id ? store.getters.client(this.client_id) : null;
    }

    get manager () {
        return store.getters.member(this.manager_id);
    }

}

export default Project;
