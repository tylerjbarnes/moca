class Resource {

    constructor (resourcePrimitive) {
        Object.assign(this, resourcePrimitive);

        // Typify
        this.cycle = parseFloat(this.cycle);

    }

}

export default Resource;
