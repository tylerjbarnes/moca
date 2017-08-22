import Person from './person.js';
class Member extends Person {

    // Identity

    get canManage () {
        return [
            'administrator',
            'manager'
        ].includes(this.role);
    }

    get lightColor () {
        return tinycolor(this.color).lighten(30).toString();
    }

    get darkColor () {
        return tinycolor(this.color).darken(20).toString();
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

    get timesLogged () {
        return store.getters.timesByContractor(this.id);
    }

    get timesLoggedOnCurrentProjects () {
        return this.timesLogged.filter(time => time.isCurrent);
    }

    get hoursLoggedOnCurrentProjects () {
        return this.timesLoggedOnCurrentProjects.map(time => time.hours).reduce((a,b) => a + b, 0);
    }

    get hoursAssignedOnCurrentProjects () {
        return this.currentProjectsAssigned.map(project => project.estimate).reduce((a,b) => a + b, 0);
    }

    get timeBarData () {
        return [
            {
                color: this.color,
                number: this.hoursLoggedOnCurrentProjects,
                label: 'Logged'
            },
            {
                color: tinycolor(this.color).setAlpha(0.5).toString(),
                number: this.hoursAssignedOnCurrentProjects - this.hoursLoggedOnCurrentProjects,
                label: 'Remaining'
            }
        ];
    }

}

export default Member;
