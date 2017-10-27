import Person from './person.js';
class Client extends Person {

    // Projects

    get projectsOwned () {
        return store.getters.projectsByClient(this.id);
    }

    get activeProjectsOwned () {
        return this.projectsOwned.filter(project => !project.archived);
    }

    // Times

    get hoursCredited() {
        return store.getters.timesByClient(this.id).filter(time => time.type === 'credit').map(time => time.hours).reduce((a,b) => a + b, 0);
    }

    get hoursLogged() {
        return store.getters.timesByClient(this.id).filter(time => time.type === 'log').map(time => time.hours).reduce((a,b) => a + b, 0);
    }

    get balance () {
        return this.hoursCredited - this.hoursLogged;
    }

    get timesLogged () {
        return store.getters.timesByClient(this.id).filter(time => time.type === 'log');
    }

    get hoursBudgetedOnActiveProjects () {
        return this.activeProjectsOwned.map(project => project.estimate).reduce((a,b) => a + b, 0);
    }

    get timeBarData () {
        return [
            {
                color: tinycolor(this.color).setAlpha(0.5).toString(),
                number: this.hoursBudgetedOnActiveProjects,
                label: 'Budgeted'
            },
            {
                color: 'transparent',
                number: this.balance,
                label: 'Available'
            }
        ];
    }

    // Packages

    get packages () {
        return store.getters.packagesByClient(this.id).sort((a,b) => a.expiration_date < b.expiration_date);
    }

    get lastPackage () {
        if (!this.packages) { return null; }
        return this.packages[0];
    }

    get expirationDescription () {
        if (!this.lastPackage) { return 'No Packages'; }
        let expirationDate = this.lastPackage.expiration_date;
        let prettyExpiration = moment(expirationDate).format('MMMM DD');
        return expirationDate < new moment().format('YYYY-MM-DD') ?
            'Expired ' + prettyExpiration :
            'Expires ' + prettyExpiration;
    }

}

export default Client;
