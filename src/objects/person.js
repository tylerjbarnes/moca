class Person {

    constructor (personPrimitive) {
        Object.assign(this, personPrimitive);

        // Typify
        this.archived = this.archived === '1';
        this.notification_time = parseInt(this.notification_time);
        this.time_offset = parseFloat(this.time_offset);

        // Presence
        this.online = false;

    }

    get firstName () {
        return this.name.split(' ')[0];
    }

}

export default Person;
