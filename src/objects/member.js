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

    get projectsManaged () {
        return store.getters.projectsByManager(this.id);
    }

    // Times

    get timesWorked () {
        return store.getters.timesByContractor(this.id);
    }

    get hoursWorked () {
        return this.timesWorked.map(time => time.hours).reduce((a,b) => a + b, 0);
    }

}

export default Member;
