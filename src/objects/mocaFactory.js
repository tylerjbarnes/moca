import Client from './client.js';
import Member from './member.js';
import Message from './message.js';
import Package from './package.js';
import Project from './project.js';
import Resource from './resource.js';
import Time from './time.js';

class MocaFactory {

    static constructObject(type, primitive) {
        if (!primitive) return null;
        switch (type) {
            case 'message': return new Message(primitive);
            case 'package': return new Package(primitive);
            case 'person': return primitive.role === 'client' ?
                new Client(primitive) :
                new Member(primitive);
            case 'project': return new Project(primitive);
            case 'resource': return new Resource(primitive);
            case 'time': return new Time(primitive);
            default: return null;
        }
    }

    static constructObjects(type, primitives) {
        return primitives.map(primitive => MocaFactory.constructObject(type, primitive));
    }

    static constructPrimitive(type, defaults) {
        let primitive = {};
        switch (type) {
            case 'message':
                primitive = {
                    id: cuid(),
                    type: null,
                    author_id: store.getters.user.id,
                    project_id: null,
                    cycle: 0,
                    content: '',
                    resolved: false,
                    datetime: null
                }; break;
            case 'package':
                primitive = {
                    id: cuid(),
                    client_id: null,
                    hours: 0,
                    expiration_date: null
                }; break;
            case 'project':
                primitive = {
                    id: cuid(),
                    name: '',
                    start: new moment().format('YYYY-MM-DD'),
                    target: null,
                    due: null,
                    estimate: 0.25,
                    max: 0.25,
                    autocycle: null,
                    cycle: 0,
                    status: 'delegate',
                    flagged: false,
                    client_id: null,
                    contractor_id: null,
                    manager_id: null,
                    archived: false,
                }; break;
            case 'resource':
                primitive = {
                    id: cuid(),
                    name: '',
                    author_id: store.state.user.id,
                    client_id: null,
                    project_id: null,
                    cycle: 0,
                    type: 'text',
                    content: {body:''}
                }; break;
            case 'time':
                primitive = {
                    id: cuid(),
                    type: 'log',
                    hours: 0.25,
                    worker_id: null,
                    client_id: null,
                    project_id: null,
                    cycle: 0,
                    memo: '',
                    package_id: null,
                    date: new moment().format('YYYY-MM-DD'),
                    pending: false
                }; break;
            default: break;
        }
        if (defaults !== undefined) {
            Object.assign(primitive, defaults);
        }
        return primitive;
    }

}

export default MocaFactory;
