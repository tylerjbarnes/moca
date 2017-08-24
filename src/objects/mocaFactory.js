import Client from './client.js';
import Member from './member.js';
import Message from './message.js';
import Package from './package.js';
import Project from './project.js';
import Resource from './resource.js';
import Time from './time.js';

class MocaFactory {

    static constructObject(type, primitive) {
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
                    client_id: null,
                    project_id: null,
                    cycle: 0,
                    type: null,
                    content: {
                        body: ''
                    }
                }; break;
            default: break;
        }
        if (defaults !== undefined) {
            Object.assign(primitive, defaults);
            console.log(primitive);
        }
        return primitive;
    }

}

export default MocaFactory;
