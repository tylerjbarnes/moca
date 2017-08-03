class MocaObject {

    // Setup

    constructor (primitive) {
        Object.assign(this, this.typify(primitive));
    }

    typify (primitive) {
        let keys = Object.keys(primitive);
        let typified = {};
        for (let key of keys) {
            switch (key) {
                case 'archived':
                case 'flagged':
                case 'pending':
                case 'resolved':
                    typified[key] = primitive[key] === '1'; break;
                case 'estimate':
                case 'max':
                case 'time_offset':
                    typified[key] = parseFloat(primitive[key]); break;
                case 'hours':
                    typified[key] = Math.abs(parseFloat(primitive[key])); break;
                case 'cycle':
                case 'notification_time':
                    typified[key] = parseInt(primitive[key]); break;
                default:
                    typified[key] = primitive[key];
            }
        }
        return typified;
    }

    // Update

    update (data) {
        Object.assign(this, this.typify(data));
    }

}

export default MocaObject;
