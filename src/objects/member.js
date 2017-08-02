import Person from './person.js';
class Member extends Person {

    // Identity

    get canManage () {
        return [
            'administrator',
            'manager'
        ].includes(this.role);
    }

    // Projects

    get projectsAssigned () {
        return store.getters.projectsByContractor(this.id);
    }

    get currentProjectsAssigned () {
        return store.getters.projectsByContractor(this.id).filter(project => project.isCurrent);
    }

    get projectsManaged () {
        return store.getters.projectsByManager(this.id);
    }

    // Times

    get timesWorked () {
        return store.getters.timesByContractor(this.id);
    }

    get timesWorkedOnCurrentProjects () {
        let timesWorked = this.timesWorked;
        return timesWorked.filter(time => time.isCurrent);
    }

    get hoursWorkedOnCurrentProjects () {
        return this.timesWorkedOnCurrentProjects.map(time => time.hours).reduce((a,b) => a + b, 0);
    }

    get hoursAssignedOnCurrentProjects () {
        return this.currentProjectsAssigned.map(project => project.estimate).reduce((a,b) => a + b, 0);
    }

}

export default Member;
