export default {
    data () { return {
        dragTimeout: null,
        isDragDelegate: false
    }},
    computed : {
        payload () {
            return null;
        }
    },
    methods: {
        mousedown (e) {
            this.dragTimeout = setTimeout(() => { this.assumeDragDelegacy(e); }, 200);
        },
        mouseup (e) {
            this.dragTimeout ?
                clearTimeout(this.dragTimeout) :
                this.surrenderDragDelegacy();
        },
        assumeDragDelegacy (e) {
            this.isDragDelegate = true;
            bus.$emit('startDrag', e, this);
            this.didAssumeDragDelegacy();
        },
        surrenderDragDelegacy () {
            this.isDragDelegate = false;
            this.dragDelta = {x:0, y:0};
            this.didSurrenderDragDelegacy();
        }
    },
    mounted () {
        this.$el.addEventListener('mousedown', (e) => { this.mousedown(e); })
        this.$el.addEventListener('mouseup', (e) => { this.mouseup(e); })
    }
}
