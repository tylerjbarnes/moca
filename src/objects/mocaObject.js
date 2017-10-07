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
        console.log('Cleaning up object ' + this.id);
    }

}

export default MocaObject;
