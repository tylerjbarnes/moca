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

}

export default MocaFactory;
