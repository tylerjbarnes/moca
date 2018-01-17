import MocaObject from './mocaObject.js';

class Time extends MocaObject {

    // related objects

    get client () {
        return store.getters.person(this.client_id);
    }

    get package () {
        return this.package_id ? store.getters.mocaPackage(this.package_id) : null;
    }

    get project () {
        return this.project_id ? store.getters.project(this.project_id) : null;
    }

    get worker () {
        return store.getters.person(this.worker_id);
    }

    // computed properties

    get inCurrentPeriod() {
        return this.date >= currentPeriod.start && this.date <= currentPeriod.end;
    }

}

export default Time;
