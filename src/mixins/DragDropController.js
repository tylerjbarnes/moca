export default {
    data () { return {
        dragStart: null,
        dropDelegateEl: null,
        previousDropDelegateEl: null,
        payload: null
    }},
    methods: {
        updateDragDelta (event) {
            if (!this.dragStart) { return; }
            let x = event.pageX - this.dragStart.x;``
            let y = event.pageY - this.dragStart.y;
            bus.$emit('updateDragDelta', {x, y});

            let dragexitEvent = new CustomEvent('dragexit');


            bus.$emit('setDragDelegateVisibility', false); /////////////////

            // console.log(document.elementFromPoint(event.pageX,event.pageY));

                this.dropDelegateEl = closestDropZone(document.elementFromPoint(event.pageX,event.pageY));

                if (this.previousDropDelegateEl !== this.dropDelegateEl) {

                    // release old
                    if (this.previousDropDelegateEl && !this.previousDropDelegateEl.contains(this.dropDelegateEl)) {
                        dragexitEvent = new CustomEvent('dragexit');
                        this.previousDropDelegateEl.dispatchEvent(dragexitEvent);
                    }

                    // attach new
                    if (this.dropDelegateEl) {
                        let dragoverEvent = new CustomEvent('dragover',{detail:this.payload});
                        this.dropDelegateEl.dispatchEvent(dragoverEvent);
                    }
                }

                this.previousDropDelegateEl = this.dropDelegateEl;

            bus.$emit('setDragDelegateVisibility', true); //////////////////

        },
        endDrag () {
            if (!this.dragStart) {return}
            this.dragStart = null;
            bus.$emit('clearDrag');
            if (this.dropDelegateEl) {
                let dropEvent = new CustomEvent('drop', {detail:this.payload});
                this.dropDelegateEl.dispatchEvent(dropEvent);
            }
        }
    },
    created () {
        bus.$on('setDragStart', (x, y, payload) => {
            this.dragStart = {x,y};
            this.payload = payload;
        });

        let me = this;
        document.addEventListener('mousemove', (e) => {
            me.updateDragDelta(e);
        });
        document.addEventListener('mouseout', (e) => {
            let from = e.relatedTarget || e.toElement;
            if (!from || from.nodeName == "HTML") {
                me.endDrag();
            }
        });
        document.addEventListener("mouseup", function(e) {
            if (me.dragStart) {
                me.endDrag();
            }
        }, true);
    }
}
