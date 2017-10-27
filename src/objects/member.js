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
        return tinycolor(this.color).lighten(32).toString();
    }

    get darkColor () {
        return tinycolor(this.color).darken(25).saturate(20).toString();
    }

    // Projects

    get projectsAssigned () {
        return store.getters.projectsByContractor(this.id);
    }

    get activeProjectsAssigned () {
        return this.projectsAssigned.filter(project => !project.archived);
    }

    get projectsManaged () {
        return store.getters.projectsByManager(this.id);
    }

    get activeProjectsManaged () {
        return this.projectsManaged.filter(project => !project.archived);
    }

    // Times

    get timesLogged () {
        return store.getters.timesByContractor(this.id);
    }

    get timesLoggedOnActiveProjects () {
        return this.timesLogged.filter(time => time.project && !time.project.archived);
    }

    get hoursLoggedOnActiveProjects () {
        return this.timesLoggedOnActiveProjects.map(time => time.hours).reduce((a,b) => a + b, 0);
    }

    get hoursAssignedOnActiveProjects () {
        return this.activeProjectsAssigned.map(project => project.estimate).reduce((a,b) => a + b, 0);
    }

    get timeBarData () {
        return [
            {
                color: this.color,
                number: this.hoursLoggedOnActiveProjects,
                label: 'Logged'
            },
            {
                color: tinycolor(this.color).setAlpha(0.5).toString(),
                number: this.hoursAssignedOnActiveProjects - this.hoursLoggedOnActiveProjects,
                label: 'Remaining'
            }
        ];
    }

}

export default Member;
