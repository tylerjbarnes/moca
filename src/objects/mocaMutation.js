class MocaMutation {

    constructor (action, objectType, objectId, propertyName, propertyValue) {
        this.action = action;
        this.object_type = objectType;
        this.object_id = objectId;
        this.property_name = propertyName;
        this.property_value = propertyValue;

        this.author_id = store.state.user.id;
    }

}

export default MocaMutation;
