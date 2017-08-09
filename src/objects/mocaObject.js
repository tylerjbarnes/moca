class MocaObject {

    // Setup

    constructor (primitive) {
        Object.assign(this, primitive);
    }

    // Update

    update (data) {
        Object.assign(this, this.typify(data));
    }

}

export default MocaObject;
