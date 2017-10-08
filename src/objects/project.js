import MocaFactory from './mocaFactory.js';
import MocaObject from './mocaObject.js';
import MocaMutationSet from '../objects/mocaMutationSet.js';

class Project extends MocaObject {

    /////////////
    // GETTERS //
    /////////////

    // Persons

    get client () {
        return this.client_id ? store.getters.person(this.client_id) : null;
    }

    get manager () {
        return store.getters.person(this.manager_id);
    }

    get contractor () {
        return store.getters.person(this.contractor_id);
    }

    // Times

    get budgetString () {
        return this.estimate == this.max ?
            this.estimate.toFixed(2) :
            this.estimate.toFixed(2) + ' - ' + this.max.toFixed(2);
    }

    get hoursLogged () {
        return store.getters.logsByProject(this.id).map(log => log.hours).reduce((a,b) => a + b, 0);
    }

    // Dates

    get dueString () {
        var hasNone = !this.target && !this.due;
        var hasBoth = this.target && this.due;
        var onlyDate = hasNone || hasBoth ? null : ( this.target ? this.target : this.due );

        if (hasNone) {
            return "";
        } else if (hasBoth) {
            if ( moment(this.target).format("MMM") == moment(this.due).format("MMM") ) {
                return moment(this.target).format("MMM D") + "-" + moment(this.due).format("D");
            } else {
                return moment(this.target).format("MMM D") + " - " + moment(this.due).format("MMM D");
            }
        } else {
            return moment(onlyDate).format("MMM D") + ( this.target ? " • Soft" : "" );
        }
    }

    get startsInCurrentPeriod () {
        return this.start >= currentPeriod.start && this.start <= currentPeriod.end;
    }

    get isCurrent () {
        return (this.status === 'do' && this.start < currentPeriod.start ) ||
            this.startsInCurrentPeriod;
    }

    get autocycleString () {
        return this.autocycle ? this.autocycle : 'never';
    }

    // Messages

    get messages () {
        return store.getters.messagesByProject(this.id).sort((a,b) => {
            return a.datetime > b.datetime;
        });
    }

    get unresolvedMessages () {
        return this.messages.filter( message => { return message.userCanResolve });
    }

    // Resources

    get resources () {
        return store.getters.resourcesByProject(this.id);
    }

    // Status

    get previousStatus () {
        switch (this.status) {
            case 'delegate': return 'send';
            case 'send': return 'approve';
            case 'approve': return 'do';
            case 'do': return 'delegate';
            default: break;
        }
    }

    get nextStatus () {
        switch (this.status) {
            case 'delegate': return 'do';
            case 'do': return 'approve';
            case 'approve': return 'send';
            case 'send': return 'delegate';
            default: break;
        }
    }

    get nextStatusActionName () {
        switch (this.status) {
            case 'do': return store.state.user.canManage ? 'Complete' : 'Submit';
            default: return this.status;
        }
    }

    get previousStatusActionName () {
        switch (this.status) {
            case 'do': return 'Undelegate';
            case 'approve': return 'Reject';
            case 'send': return 'Unapprove';
            default: break;
        }
    }

    get canMoveBackward () {
        return this.status != 'delegate';
    }


    /////////////
    // Setters //
    /////////////

    // Status

    move (backward) {
        new MocaMutationSet(
            'update',
            'project',
            this.id,
            {'status': backward ? this.previousStatus : this.nextStatus}
        ).commit();
    }
    moveForward () { this.move(false); }
    moveBackward () { this.move(true); }


    ///////////////////////
    // Mutation Messages //
    ///////////////////////

    generateMutationMessage(mutation, oldValue) {

        // Whitelist Actions that Send Messages
        if (mutation.action == 'delete' || !(
            ( // Approve/Reject
                mutation.object_type == 'project' &&
                mutation.property_name == 'status' &&
                (
                    oldValue == 'approve' ||
                    oldValue == 'do' && mutation.property_value == 'approve'
                )
            ) ||
            ( // Any Resource Mutation Except Datetime & Last Editor
                mutation.object_type == 'resource' &&
                mutation.property_name != 'datetime' &&
                mutation.property_name != 'last_editor_id'
            )
        )) { return; }

        // Construct Message Primitive
        let messagePrimitive = MocaFactory.constructPrimitive('message', {
            cycle: this.cycle,
            resolved: true,
            type: 'mutation',
            project_id: this.id,
            datetime: new moment().utc().format('YYYY-MM-DD HH:mm:ss'),
            content: {
                action: mutation.action,
                object_type: mutation.object_type,
                object_id: mutation.object_id,
                property_name: mutation.property_name,
                old_value: oldValue,
                new_value: mutation.property_value
            }
        });

        // Dispatch New Message
        new MocaMutationSet(
            'create',
            'message',
            messagePrimitive.id,
            messagePrimitive
        ).commit();

    }

}

export default Project;
