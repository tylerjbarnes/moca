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
    }

    subscribeToChannels () {
        this.presenceChannel = this.pusher.subscribe('presence-all');
        this.publicChannel = this.pusher.subscribe('members');
        this.privateChannel = store.state.user.role == 'contractor' ?
            this.pusher.subscribe('private-contractor-' + store.state.user.id) :
            this.pusher.subscribe('private-managers');
    }

    // Bindings

    bindPresenceEvents () {
        let me = this;
        this.presenceChannel.bind('pusher:subscription_succeeded', () => {
            me.presenceChannel.members.each(member => {
                store.getters.person(member.id).online = true;
            });
        });
        this.presenceChannel.bind('pusher:member_added', member => {
            store.getters.person(member.id).online = true;
        });
        this.presenceChannel.bind('pusher:member_removed', member => {
            store.getters.person(member.id).online = false;
        });
    }

    bindMutationEvents () {
        this.pusher.bind('mutate', mutations => {
            store.dispatch('importMutations', mutations);
        });
    }

    bindStateEvents () {
        this.pusher.connection.bind('state_change', states => {
            if (states.current == 'unavailable') {
                alert('Hmm, looks like we lost the connection. Please refresh to avoid losing future changes!');
            }
        });
    }

    // Getters

    get socketId () {
        let connection = this.pusher.connection;
        return connection ? connection.socket_id : null;
    }

}

export default MocaPusher;
