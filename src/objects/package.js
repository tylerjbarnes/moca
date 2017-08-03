class Package {

    constructor (packagePrimitive) {
        Object.assign(this, packagePrimitive);

        // Typify
        this.hours = parseFloat(this.hours);

    }

    get time () {
        return store.getters.purchaseForPackage(this.id);
    }

}

export default Package;
