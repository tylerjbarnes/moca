import MocaMutationSet from '../objects/mocaMutationSet.js';
import MocaObject from './mocaObject.js';

class Person extends MocaObject {

    // computed properties

    get firstName () {
        return this.name.split(' ')[0];
    }

    get online () {
        return store.getters.online(this.id);
    }

    // actions

    /**
     * archive person
     */
    archive () {
        new MocaMutationSet(
            'update', 'person',
            this.id, {
                'archived' : true,
            }
        ).commit();
    }

    /**
     * unarchive person
     */
    unarchive () {
        new MocaMutationSet(
            'update', 'person',
            this.id, {
                'archived' : false,
            }
        ).commit();
    }

}

export default Person;
