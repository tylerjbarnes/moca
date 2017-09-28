class MocaMutation {

    constructor (action, objectType, objectId, propertyName, propertyValue) {
        this.action = action;
        this.objectType = objectType;
        this.objectId = objectId;
        this.propertyName = propertyName;
        this.propertyValue = propertyValue;

        this.authorId = store.state.user.id;
    }

}

export default MocaMutation;
