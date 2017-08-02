class Time {

    constructor (timePrimitive) {
        Object.assign(this, timePrimitive);

        // Typify
        this.cycle = parseFloat(this.cycle);
        this.hours = Math.abs(parseFloat(this.hours));
        this.pending = this.pending === '1';

    }

    get project () {
        return this.project_id ? store.getters.project(this.project_id) : null;
    }

    get isCurrent() {
        return this.project && this.project.isCurrent;
    }

    get isInCurrentPeriod() {
        return this.date >= currentPeriod.start && this.date <= currentPeriod.end;
    }

}

export default Time;
