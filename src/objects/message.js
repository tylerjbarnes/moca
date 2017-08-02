class Message {

    constructor (messagePrimitive) {
        Object.assign(this, messagePrimitive);

        // Typify
        this.cycle = parseInt(this.cycle);
        this.resolved = this.resolved === '1';

    }

}

export default Message;
