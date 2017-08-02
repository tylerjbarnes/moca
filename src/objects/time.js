class Time {

    constructor (timePrimitive) {
        Object.assign(this, timePrimitive);

        // Typify
        this.cycle = parseFloat(this.cycle);
        this.hours = parseFloat(this.hours);
        this.pending = this.pending === '1';

    }

}

export default Time;
