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

}

export default Message;
