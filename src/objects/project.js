import MocaFactory from './mocaFactory.js';
import MocaMutationSet from '../objects/mocaMutationSet.js';
import MocaObject from './mocaObject.js';

class Project extends MocaObject {

    // related objects

    get client () {
        return this.client_id ? store.getters.person(this.client_id) : null;
    }

    get contractor () {
        return this.contractor_id ? store.getters.person(this.contractor_id) : null;
    }

    get manager () {
        return store.getters.person(this.manager_id);
    }

    get messages () {
        return store.getters.messagesByProject(this.id);
    }

    get resources () {
        return store.getters.resourcesByProject();
    }

    // computed properties

    get autocycleString () {
        return this.autocycle ? this.autocycle : 'never';
    }

    get budgetString () {
        return this.estimate == this.max ?
            this.estimate.toFixed(2) :
            this.estimate.toFixed(2) + ' - ' + this.max.toFixed(2);
    }

    get canMoveBackward () {
        return this.status != 'delegate';
    }

    get chatMessages () {
        return this.messages.filter(message => message.type == 'chat');
    }

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

    get earliestDue () {
        return this.target || this.due;
    }

    get future () {
        return moment(this.start).diff(moment()) >= 0;
    }

    get hasPendingTimeRequest () {
        return this.messages.find( message => { return message.type == 'request' && !message.resolved });
    }

    get hoursLogged () {
        return store.getters.timesByProject(this.id)
            .filter(time => time.cycle === this.cycle)
            .map(log => log.hours).reduce((a,b) => a + b, 0);
    }

    get lastChatMessage () {
        return this.chatMessages.length ? this.chatMessages[this.chatMessages.length - 1] : null;
    }

    get lastMutationMessage () {
        let mutationMessages = this.messages.reverse().filter(message => message.type == 'mutation');
        return mutationMessages.length ? mutationMessages[0] : null;
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
            case 'do': return store.getters.user.canManage ? 'Complete' : 'Submit';
            default: return this.status;
        }
    }

    get overdue () {
        return moment(this.due).diff(moment(), 'days') < 0;
    }

    get previousStatus () {
        switch (this.status) {
            case 'delegate': return 'send';
            case 'send': return 'approve';
            case 'approve': return 'do';
            case 'do': return 'delegate';
            default: break;
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

    get startsInCurrentPeriod () {
        return this.start >= currentPeriod.start && this.start <= currentPeriod.end;
    }

    get unresolvedMessages () {
        return store.getters.unresolvedMessagesByProject(this.id);
    }

    // actions

    /**
     * archive project
     */
    archive () {
        new MocaMutationSet(
            'update', 'project',
            this.id, {
                'archived' : true,
            }
        ).commit();
    }

    /**
     * create a new message object that describes the mutation
     * @param  {MocaMutation} mutation
     * @param  {any} oldValue
     */
    generateMutationMessage(mutation, oldValue) {

        // Whitelist Actions that Send Messages
        if (mutation.action == 'delete' || !(
            ( // Approve/Reject
                mutation.object_type == 'project' &&
                mutation.property_name == 'status' &&
                (
                    oldValue == 'approve' && (mutation.property_value == 'do' || mutation.property_value == 'send') ||
                    oldValue == 'do' && mutation.property_value == 'approve'
                )
            ) ||
            ( // Any Resource Mutation Except Datetime & Last Editor, Or Original
                mutation.object_type == 'resource' &&
                mutation.property_name != 'datetime' &&
                mutation.property_name != 'last_editor_id' &&
                (mutation.action != 'create' || mutation.property_value.name != 'Overview')
            ) ||
            ( // Approve/Reject Time Request
                mutation.object_type == 'message' &&
                mutation.action == 'update' &&
                mutation.property_name == 'resolved' &&
                this.messages.find(message => message.id == mutation.object_id).type == 'request'
            ) ||
            ( // Recycle or Archive
                mutation.object_type == 'project' &&
                mutation.property_name == 'cycle'
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

        // Dispatch New Message or Edit Duplicate
        if (
            this.lastMutationMessage &&
            this.lastMutationMessage.content.object_id == messagePrimitive.content.object_id &&
            this.lastMutationMessage.author_id == store.state.user.id &&
            this.lastMutationMessage.content.property_name != 'status' &&
            this.lastMutationMessage.content.property_name != 'cycle'
        ) {
            delete messagePrimitive.id;
            new MocaMutationSet(
                'update',
                'message',
                this.lastMutationMessage.id,
                messagePrimitive
            ).commit();
        } else {
            new MocaMutationSet(
                'create',
                'message',
                messagePrimitive.id,
                messagePrimitive
            ).commit();
        }

    }

    /**
     * move project status backward
     */
    moveBackward () {
        new MocaMutationSet(
            'update', 'project',
            this.id, {
                'status': this.previousStatus,
                'contractor_id': this.previousStatus == 'delegate' ? null : this.contractor_id
            }
        ).commit();
    }

    /**
     * move project status forward
     */
    moveForward () {
        this.status == 'send' ?
            this.recycleOrArchive() :
            new MocaMutationSet(
                'update', 'project',
                this.id, {
                    'status': this.nextStatus
                }
            ).commit();
    }

    /**
     * recycle project
     */
    recycle () {
        new MocaMutationSet(
            'update', 'project',
            this.id, {
                'archived' : false,
                'contractor_id': null,
                'status': 'delegate',
                'cycle': this.cycle + 1,
                'start': moment().format('YYYY-MM-DD'),
                'target': this.target ? moment().add(moment(this.target).diff(moment(this.start), 'days'),'d').format('YYYY-MM-DD') : null,
                'due': this.due ? moment().add(moment(this.due).diff(moment(this.start), 'days'),'d').format('YYYY-MM-DD') : null
            }
        ).commit();
    }

    /**
     * get recycle date
     * @param  {string} date
     * @return {string}
     */
    recycleDate (date) {
        if (!date) { return null; }
        switch (this.autocycle) {
            case 'daily': return moment(date).add(1, 'd').format('YYYY-MM-DD');
            case 'weekly': return moment(date).add(1, 'w').format('YYYY-MM-DD');
            case 'monthly': return moment(date).add(1, 'M').format('YYYY-MM-DD');
            default: return date;
        }
    }

    /**
     * recycle or archive project
     */
    recycleOrArchive () {
        this.autocycle ?
            new MocaMutationSet(
                'update', 'project',
                this.id, {
                    'contractor_id': null,
                    'status': this.nextStatus,
                    'cycle': this.cycle + 1,
                    'start': this.recycleDate(this.start),
                    'target': this.recycleDate(this.target),
                    'due': this.recycleDate(this.due)
                }
            ).commit() :
            new MocaMutationSet(
                'update', 'project',
                this.id, {
                    'status': this.nextStatus,
                    'archived': true
                }
            ).commit();
    }

    /**
     * unarchive project
     */
    unarchive () {
        new MocaMutationSet(
            'update', 'project',
            this.id, {
                'archived' : false,
            }
        ).commit();
    }

}

export default Project;
