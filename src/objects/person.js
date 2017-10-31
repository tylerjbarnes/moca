import MocaObject from './mocaObject.js';
import MocaMutationSet from '../objects/mocaMutationSet.js';

class Person extends MocaObject {

    constructor (personPrimitive) {
        super(personPrimitive);
        this.online = false;
    }

    get firstName () {
        return this.name.split(' ')[0];
    }

    archive () {
        new MocaMutationSet(
            'update', 'person',
            this.id, {
                'archived' : true,
            }
        ).commit();
    }

}

export default Person;
