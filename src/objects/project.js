import MocaObject from './mocaObject.js';
class Project extends MocaObject {

    // Persons

    get client () {
        return this.client_id ? store.getters.person(this.client_id) : null;
    }

    get manager () {
        return store.getters.person(this.manager_id);
    }

    get contractor () {
        return store.getters.person(this.contractor_id);
    }

    // Times

    get budgetString () {
        return this.estimate == this.max ?
            this.estimate.toFixed(2) :
            this.estimate.toFixed(2) + ' - ' + this.max.toFixed(2);
    }

    get hoursLogged () {
        return store.getters.logsByProject(this.id).reduce((a,b) => a + b, 0);
    }

    // Dates

    get dueString () {
        var hasNone = !this.target && !this.due;
        var hasBoth = this.target && this.due;
        var onlyDate = hasNone || hasBoth ? null : ( this.target ? this.target : this.due );

        if (hasNone) {
            return "";
        } else if (hasBoth) {
            if ( moment(this.target).format("MMM") == moment(this.due).format("MMM") ) {
                return moment(this.target).format("MMM D") + "-" + moment(this.due).format("D");
            } else {
                return moment(this.target).format("MMM D") + " - " + moment(this.due).format("MMM D");
            }
        } else {
            return moment(onlyDate).format("MMM D") + ( this.target ? " • Soft" : "" );
        }
    }

    get startsInCurrentPeriod () {
        return this.start >= currentPeriod.start && this.start <= currentPeriod.end;
    }

    get isCurrent () {
        return (this.status === 'do' && this.start < currentPeriod.start ) ||
            this.startsInCurrentPeriod;
    }

    get autocycleString () {
        return this.autocycle ? this.autocycle : 'never';
    }

    // Messages

    get messages () {
        return store.getters.messagesByProject(this.id);
    }

    get unresolvedMessages () {
        return this.messages.filter( message => { return !message.resolved });
    }

    // Resources

    get resources () {
        return store.getters.resourcesByProject(this.id);
    }

}

export default Project;
