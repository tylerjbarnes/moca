class Project {

    constructor (projectPrimitive) {
        Object.assign(this, projectPrimitive);
    }

    get manager () {
        return store.getters.person(this.manager_id);
    }

}

export default Project;
