class MocaObject {

    // Setup

    constructor (primitive) {
        Object.assign(this, primitive);
        if (this.archived !== undefined) this.archived = this.archived === 1;
        if (this.flagged !== undefined) this.flagged = this.flagged === 1;
        if (this.resolved !== undefined) this.resolved = this.resolved === 1;
    }

    // Update

    update (delta) {
        Object.assign(this, delta);
    }
    //
    // // Deletion
    //
    // cleanUp () {
    //     store.dispatch('cleanup', this.id);
    // }

}

export default MocaObject;
