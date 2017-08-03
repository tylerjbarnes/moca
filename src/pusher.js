class MocaPusher {

    // Setup

    constructor () {
        this.pusher = new Pusher(
            '2a9730534281c98fb4b3',
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
        this.bindObjectEvents();
    }

    subscribeToChannels () {
        this.presenceChannel = this.pusher.subscribe("presence-all");
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

    bindObjectEvents () {
        let me = this;
        me.pusher.bind('add-project', data => { store.dispatch('addObject', {type: 'project', primitive: data}) });
        me.pusher.bind('update-project', data => { store.dispatch('updateProject', data) });
        me.pusher.bind('remove-project', id => { store.dispatch('removeObject', {type: 'project', id}) });
    }

    // Getters

    get socketId () {
        let connection = this.pusher.connection;
        return connection ? connection.socket_id : null;
    }

}

export default MocaPusher;
