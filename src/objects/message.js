import MocaObject from './mocaObject.js';
class Message extends MocaObject {

    get author () {
        return store.getters.person(this.author_id);
    }

}

export default Message;
