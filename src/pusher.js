class MocaPusher {

    // Setup

    constructor () {
        this.pusher = new Pusher(
            pusherKey,
            {
                authEndpoint: '/pusher_auth',
                cluster: 'us2'
            }
        );
        let me = this;
        this.pusher.connection.bind('connected', function() {
            me.init();
        });
    }

    init () {
        this.subscribeToChannels();
        this.bindPresenceEvents();
        this.bindMutationEvents();
        this.bindStateEvents();
        this.bindSyncEvents();
    }

    subscribeToChannels () {
        this.presenceChannel = this.pusher.subscribe('presence-all');
        this.publicChannel = this.pusher.subscribe('members');
        this.privateChannel = store.getters.user.role == 'contractor' ?
            this.pusher.subscribe('private-contractor-' + store.getters.user.id) :
            this.pusher.subscribe('private-managers');
    }

    // Bindings

    bindPresenceEvents () {
        let me = this;
        this.presenceChannel.bind('pusher:subscription_succeeded', () => {
            me.presenceChannel.members.each(member => {
                // store.getters.person(member.id).online = true; // @TODO
            });
        });
        this.presenceChannel.bind('pusher:member_added', member => {
            // store.getters.person(member.id).online = true; // @TODO
        });
        this.presenceChannel.bind('pusher:member_removed', member => {
            // store.getters.person(member.id).online = false; // @TODO
        });
    }

    bindMutationEvents () {
        this.pusher.bind('mutate', mutations => {
            store.dispatch('importMutations', mutations);
        });
    }

    bindSyncEvents () {
        this.pusher.bind('gain', object => {
            store.dispatch('gainObject', object);
        });
        this.pusher.bind('lose', object => {
            store.dispatch('loseObject', object);
        });
    }

    bindStateEvents () {
        this.pusher.connection.bind('state_change', states => {
            console.log('Pusher State Changed: ' + states.current);
        });
    }

    // Getters

    get socketId () {
        let connection = this.pusher.connection;
        return connection ? connection.socket_id : null;
    }

}

export default MocaPusher;
