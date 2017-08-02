class Package {

    constructor (packagePrimitive) {
        Object.assign(this, packagePrimitive);

        // Typify
        this.hours = parseFloat(this.hours);

    }

}

export default Package;
