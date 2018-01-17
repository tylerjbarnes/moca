class MocaObject {

    // Setup

    constructor (primitive) {
        Object.assign(this, primitive);
    }

    // Update

    update (delta) {
        Object.assign(this, delta);
    }

    // Deletion

    cleanUp () {
        store.dispatch('cleanup', this.id);
    }

}

export default MocaObject;
