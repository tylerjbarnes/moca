class Project {

    constructor (projectPrimitive) {
        Object.assign(this, projectPrimitive);

        // Typify
        this.archived = this.archived === '1';
        this.cycle = parseFloat(this.cycle);
        this.estimate = parseFloat(this.estimate);
        this.flagged = this.flagged === '1';
        this.max = parseFloat(this.max);

    }

    // Persons

    get client () {
        return this.client_id ? store.getters.client(this.client_id) : null;
    }

    get manager () {
        return store.getters.member(this.manager_id);
    }

    get contractor () {
        return store.getters.member(this.contractor_id);
    }

    // Times

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

    // Messages

    get unresolvedMessages () {
        let messages = store.getters.messagesByProject(this.id);
        return messages.filter( message => { return !message.resolved });
    }

}

export default Project;
