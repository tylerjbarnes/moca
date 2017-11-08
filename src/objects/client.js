import Person from './person.js';
class Client extends Person {

    // Projects

    get projectsOwned () {
        return store.getters.projectsByClient(this.id);
    }

    get activeProjectsOwned () {
        return this.projectsOwned.filter(project => !project.archived);
    }

    // Resources

    get resources () {
        return store.getters.resourcesByClient(this.id).filter(resource => !resource.project_id);
    }

    // Times

    get hoursCredited() {
        return store.getters.timesByClient(this.id).filter(time => time.type === 'credit').map(time => time.hours).reduce((a,b) => a + b, 0);
    }

    get hoursDebited() {
        return store.getters.timesByClient(this.id).filter(time => time.type !== 'credit').map(time => time.hours).reduce((a,b) => a + b, 0);
    }

    get balance () {
        return this.hoursCredited - this.hoursDebited;
    }

    get timesLogged () {
        return store.getters.timesByClient(this.id).filter(time => time.type === 'log');
    }

    get hoursBudgetedOnActiveProjects () {
        return this.activeProjectsOwned.map(project => project.estimate).reduce((a,b) => a + b, 0);
    }

    get hoursAvailable () {
        return this.balance - this.hoursBudgetedOnActiveProjects;
    }

    // Packages

    get packages () {
        return store.getters.packagesByClient(this.id).sort((a,b) => a.expiration_date < b.expiration_date);
    }

    get lastPackage () {
        if (!this.packages) { return null; }
        return this.packages[0];
    }

    get expired () {
        if (!this.lastPackage) { return false; }
        return this.lastPackage.expiration_date < new moment().format('YYYY-MM-DD') && this.balance > 0;
    }

    get expirationDescription () {
        if (!this.lastPackage) { return 'No Packages'; }
        let expirationDate = this.lastPackage.expiration_date;
        let prettyExpiration = moment(expirationDate).format('MMM D');
        return expirationDate < new moment().format('YYYY-MM-DD') ?
            'Expired ' + prettyExpiration :
            'Expires ' + prettyExpiration;
    }

}

export default Client;
