class MocaObject {

    // Setup

    constructor (primitive) {
        Object.assign(this, primitive);
        if (this.archived !== undefined) this.archived = this.archived === 1;
        if (this.flagged !== undefined) this.flagged = this.flagged === 1;
        if (this.resolved !== undefined) this.resolved = this.resolved === 1;
        if (this.hours !== undefined) this.hours = parseFloat(this.hours);
        if (this.estimate !== undefined) this.estimate = parseFloat(this.estimate);
        if (this.max !== undefined) this.max = parseFloat(this.max);
        if (this.cycle !== undefined) this.cycle = parseInt(this.cycle);
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
