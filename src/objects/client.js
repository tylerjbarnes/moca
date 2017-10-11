import Person from './person.js';
class Client extends Person {

    // Projects

    get projectsOwned () {
        return store.getters.projectsByClient(this.id);
    }

    get currentProjectsOwned () {
        return store.getters.projectsByClient(this.id).filter(project => project.isCurrent);
    }

    // Times

    get hoursPurchased() {
        return store.getters.timesByClient(this.id).filter(time => time.type === 'purchase').map(time => time.hours).reduce((a,b) => a + b, 0);
    }

    get hoursLogged() {
        return store.getters.timesByClient(this.id).filter(time => time.type === 'log').map(time => time.hours).reduce((a,b) => a + b, 0);
    }

    get balance () {
        return this.hoursPurchased - this.hoursLogged;
    }

    get timesLogged () {
        return store.getters.timesByClient(this.id).filter(time => time.type === 'log');
    }
    get timesLoggedSinceLastPurchase () {
        if ( !this.lastPackage ) { return []; }
        console.log(this.lastPackage);
        return this.timesLogged.filter(time => time.date >= this.lastPackage.time.date);
    }
    get hoursSpentSinceLastPurchase () {
        return this.timesLoggedSinceLastPurchase.map(time => time.hours).reduce((a,b) => a + b, 0);
    }

    get hoursBudgetedOnCurrentProjects () {
        return this.currentProjectsOwned.map(project => project.estimate).reduce((a,b) => a + b, 0);
    }

    get timeBarData () {
        return [
            {
                color: this.color,
                number: this.hoursSpentSinceLastPurchase,
                label: 'Spent'
            },
            {
                color: tinycolor(this.color).setAlpha(0.5).toString(),
                number: this.hoursBudgetedOnCurrentProjects,
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
