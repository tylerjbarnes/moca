import MocaObject from './mocaObject.js';
class Time extends MocaObject {

    get project () {
        return this.project_id ? store.getters.project(this.project_id) : null;
    }

    get worker () {
        return store.getters.person(this.worker_id);
    }

    get client () {
        return store.getters.person(this.client_id);
    }

    get package () {
        return store.getters.mocaPackage(this.package_id);
    }

    get isInCurrentPeriod() {
        return this.date >= currentPeriod.start && this.date <= currentPeriod.end;
    }

}

export default Time;
