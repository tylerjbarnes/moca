import Person from './person.js';

class Client extends Person {

    // related objects

    get lastPackage () {
        return this.packages ? this.packages[0] : null;
    }

    get packages () {
        return store.getters.packagesByClient(this.id);
    }

    get projects () {
        return store.getters.projectsByClient(this.id);
    }

    get timesLogged () {
        return store.getters.timesByClient(this.id).filter(time => time.type === 'log');
    }

    // computed properties

    get balance () {
        return store.getters.balance(this.id);
    }

    get expirationDescription () {
        if (!this.lastPackage) { return 'No Packages'; }
        let expirationDate = this.lastPackage.expiration_date;
        let prettyExpiration = moment(expirationDate).format('MMM D');
        return expirationDate < new moment().format('YYYY-MM-DD') ?
            'Expired ' + prettyExpiration :
            'Expires ' + prettyExpiration;
    }

    get expired () {
        return this.balance > 0 &&
            this.lastPackage &&
            this.lastPackage.expiration_date < new moment().format('YYYY-MM-DD');
    }

    get hoursAvailable () {
        return this.balance - this.hoursBudgetedOnActiveProjects;
    }

    get hoursBudgetedOnActiveProjects () {
        return this.projects.map(project => project.estimate).reduce((a,b) => a + b, 0);
    }

    get hoursCredited() {
        return store.getters.timesByClient(this.id).filter(time => time.type === 'credit').map(time => time.hours).reduce((a,b) => a + b, 0);
    }

    get hoursDebited() {
        return store.getters.timesByClient(this.id).filter(time => time.type !== 'credit').map(time => time.hours).reduce((a,b) => a + b, 0);
    }

}

export default Client;
