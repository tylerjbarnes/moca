import MocaObject from './mocaObject.js';
class Message extends MocaObject {

    get author () {
        return store.getters.person(this.author_id);
    }

    get userCanResolve () {
        return !this.resolved &&
            this.author &&
            this.author.canManage !== store.state.user.canManage;
    }

    get mutationDescription () {
        if (this.type !== 'mutation') { return; }

        let string = '';
        let name = this.author.id == store.state.user.id ? 'You' : this.author.firstName;
        switch (this.content.object_type) {
            case 'project':
                let action = [
                    this.content.property_name,
                    this.content.old_value,
                    this.content.new_value
                ].join();
                switch (action) {
                    case 'status,approve,do': string = name + ' rejected submission'; break;
                    case 'status,approve,send': string = name + ' approved submission'; break;
                    default: break;
                }
                break;
            case 'resource':
                let resourceName = store.getters.resource(this.content.object_id).name;
                switch (this.content.action) {
                    case 'create': string = name + ' added a resource: ' + resourceName; break;
                    case 'update': string = name + ' edited ' + resourceName; break;
                    default: break;
                }
                break;
            default: break;
        }

        return string ? string : 'Unrecognized Activity';

    }

    cleanUp () {
        console.log('Cleaning up message ' + this.id);
    }

}

export default Message;
