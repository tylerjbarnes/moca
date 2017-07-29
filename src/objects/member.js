import Person from './person.js';
class Member extends Person {

    get projects () {
        return store.getters.projectsByContractor(this.id);
    }

}

export default Member;
