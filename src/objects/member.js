import Person from './person.js';

class Member extends Person {

    // related objects

    get projectsAssigned () {
        return store.getters.projectsByContractor(this.id);
    }

    get projectsManaged () {
        return store.getters.projectsByManager(this.id);
    }

    get times () {
        return store.getters.timesByContractor(this.id);
    }

    // computed properties

    get canManage () {
        return ['administrator', 'manager'].includes(this.role);
    }

    get darkColor () {
        return tinycolor(this.color).darken(25).saturate(20).toString();
    }

    get lightColor () {
        return tinycolor(this.color).lighten(32).toString();
    }

}

export default Member;
