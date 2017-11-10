import MocaObject from './mocaObject.js';
import MocaMutationSet from '../objects/mocaMutationSet.js';

class Message extends MocaObject {

    get project () {
        return store.getters.project(this.project_id);
    }

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
        let style = 'simple';
        let name = this.author.id == store.state.user.id ? 'You' : this.author.firstName;
        switch (this.content.object_type) {
            case 'project':
                if (this.content.property_name == 'cycle') {
                    string = 'Cycle ' + (this.content.new_value + 1);
                    style = 'section-heading';
                } else {
                    // Status
                    let action = [
                        this.content.property_name,
                        this.content.old_value,
                        this.content.new_value
                    ].join();
                    switch (action) {
                        case 'status,do,approve':
                            string = this.author.canManage ?
                                name + ' marked this complete' :
                                name + ' submitted for approval';
                            break;
                        case 'status,approve,do': string = name + ' rejected this'; break;
                        case 'status,approve,send': string = name + ' approved this'; break;
                        default: break;
                    }
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
            case 'message':
                let request = store.getters.message(this.content.object_id);
                let requesterName = request.author_id == store.state.user.id ? 'your' : store.getters.person(request.author_id).firstName + "'s";
                switch (request.content.granted) {
                    case true: string = name + ' allowed ' + requesterName + ' time request'; break;
                    default: string = name + ' denied ' + requesterName + ' time request'; break;
                }
            default: break;
        }

        return {
            string: string || 'Unrecognized Activity',
            style
        };

    }

    get requestDescription () {
        let hoursString = this.content.hours ? '<strong>' + this.content.hours + ' more hour' + (this.content.hours != 1 ? 's' : '') + '</strong>' : '';
        let dueString = this.content.due ? 'a later due date of <strong>' + moment(this.content.due).format("MMM D") + '</strong>': '';
        let both = hoursString && dueString;
        let name = this.author.id == store.state.user.id ? 'You' : this.author.firstName;
        return name + ' requested '
            + hoursString + ( both ? '<br>and ' : '' ) + dueString
            + '<br><strong>"' + this.content.reason +'"</strong>';
    }

    cleanUp () {
        console.log('Cleaning up message ' + this.id);
    }


    /////////////
    // Setters //
    /////////////

    resolve (granted) {
        let newContent = {};
        Object.assign(newContent, this.content);
        newContent.granted = granted;
        new MocaMutationSet(
            'update', 'message',
            this.id, {
                content: newContent,
                'resolved': true
            }
        ).commit();
    }
    reject () {
        this.resolve(false);
    }
    approve () {
        this.resolve(true);
        let project = store.getters.project(this.project_id);
        new MocaMutationSet(
            'update', 'project',
            project.id, {
                max: this.content.hours ? project.max + this.content.hours : project.max,
                due: this.content.due ? this.content.due : project.due
            }
        ).commit();
    }

}

export default Message;
