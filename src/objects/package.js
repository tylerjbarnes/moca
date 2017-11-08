import MocaObject from './mocaObject.js';
import MocaMutationSet from '../objects/mocaMutationSet.js';
import MocaFactory from '../objects/mocaFactory.js';

class Package extends MocaObject {

    get time () {
        return store.getters.creditForPackage(this.id);
    }

    get client () {
        return store.getters.person(this.client_id);
    }

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

    extend (dateString) {
        new MocaMutationSet(
            'update', 'package',
            this.client.lastPackage.id, {expiration_date: dateString}
        ).commit();
    }

}

export default Package;
