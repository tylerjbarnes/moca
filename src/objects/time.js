import MocaObject from './mocaObject.js';
class Time extends MocaObject {

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
