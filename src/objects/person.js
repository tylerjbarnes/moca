import MocaObject from './mocaObject.js';
class Person extends MocaObject {

    constructor (personPrimitive) {
        super(personPrimitive);
        this.online = false;
    }

    get firstName () {
        return this.name.split(' ')[0];
    }

}

export default Person;
