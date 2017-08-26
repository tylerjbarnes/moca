class MocaObject {

    // Setup

    constructor (primitive) {
        Object.assign(this, primitive);
    }

    // Update

    update (delta) {
        Object.assign(this, delta);
    }

}

export default MocaObject;
