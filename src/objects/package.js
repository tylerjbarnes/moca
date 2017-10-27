import MocaObject from './mocaObject.js';
class Package extends MocaObject {

    get time () {
        return store.getters.creditForPackage(this.id);
    }

}

export default Package;
