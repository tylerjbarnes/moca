import MocaFactory from '../objects/mocaFactory.js';
import MocaMutationSet from '../objects/mocaMutationSet.js';
import MocaObject from './mocaObject.js';

class Package extends MocaObject {

    // related objects

    get client () {
        return store.getters.person(this.client_id);
    }

    get time () {
        return store.getters.creditByPackage(this.id);
    }

    // actions

    /**
     * expire package
     */
    expire () {
        let primitive = MocaFactory.constructPrimitive('time', {
            type: 'expiration',
            hours: this.client.balance,
            client_id: this.client_id,
            package_id: this.client.lastPackage.id
        });
        new MocaMutationSet(
            'create', 'time',
            primitive.id, primitive
        ).commit();
    }

    /**
     * extend package
     * @param  {string} dateString
     */
    extend (dateString) {
        new MocaMutationSet(
            'update', 'package',
            this.client.lastPackage.id, {expiration_date: dateString}
        ).commit();
    }

}

export default Package;
