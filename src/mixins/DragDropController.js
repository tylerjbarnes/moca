export default {
    data () { return {
        dragStart: null,
        dragDelegate: null,
        dropDelegateEl: null,
        previousDropzoneEls: [],
        payload: null,
        mousePosition: {x:0, y:0},
        delta: {x:0, y:0}
    }},
    methods: {
        startDrag (e, dragDelegate) {
            this.dragStart = {
                x: e.clientX,
                y: e.clientY - offset(this.$el).top
            }
            this.dragDelegate = dragDelegate;
            this.payload = dragDelegate.payload;
            bus.$emit('didStartDrag', dragDelegate.payload);
        },
        updateDeltaViaMove (e) {
            this.mousePosition.x = e.pageX;
            this.mousePosition.y = e.pageY;
            this.delta.x = this.mousePosition.x - this.dragStart.x;
            this.delta.y = this.mousePosition.y - this.dragStart.y - offset(this.$el).top;
        },
        updateDeltaViaScroll () {
            this.delta.y = this.mousePosition.y - this.dragStart.y - offset(this.$el).top;
        },
        moveDrag (e) {

            // Update Drag Delta
            this.dragDelegate.dragDelta = this.delta;

            // "Pass-Through" Drag Delegate (temporarily hide)
            this.dragDelegate.$el.style.display = 'none';

            // Find Current Dropzone Elements
            let dropzoneEls = dropzonesForElement(document.elementFromPoint(event.pageX,event.pageY));

            // Dispatch "Enter" to Added Dropzone Elements
            let addedDropzoneEls = dropzoneEls.filter(el => !this.previousDropzoneEls.includes(el));
            for (let el of addedDropzoneEls) { el.dispatchEvent(new CustomEvent('dragenter', {detail:this.payload})); }

            // Dispatch "Exit" to Removed Dropzone Elements
            let removedDropzoneEls = this.previousDropzoneEls.filter(el => !dropzoneEls.includes(el));
            for (let el of removedDropzoneEls) { el.dispatchEvent(new CustomEvent('dragexit')); }

            // Set Drop Delegate
            this.dropDelegateEl = dropzoneEls.length ? dropzoneEls[0] : null;

            // Update "Previous" Set of Dropzone Elements
            this.previousDropzoneEls = dropzoneEls;

            // Remove Pass-Through
            this.dragDelegate.$el.style.display = null;

        },
        endDrag (e) {
            this.dragDelegate.surrenderDragDelegacy();
            this.dragDelegate = null;
            this.dragStart = null;
            this.delta = {x:0, y:0};
            bus.$emit('didEndDrag', e);

            if (this.dropDelegateEl) {
                this.dropDelegateEl.dispatchEvent(
                    new CustomEvent('drop', {detail:this.payload})
                );
                this.dropDelegateEl = null;
            }

        }
    },
    mounted () {

        // Start Drag
        bus.$on('startDrag', (e, dragDelegate) => {
            if (!this.$el.contains(e.target)) { return; }
            this.startDrag(e, dragDelegate);
        });

        // Move Drag
        document.addEventListener('mousemove', (e) => {
            if (!this.dragDelegate) { return; }
            this.updateDeltaViaMove(e);
            this.moveDrag(e);
        });
        document.body.addEventListener('scroll', (e) => {
            if (!this.dragDelegate) { return; }
            if (!this.$el.contains(this.dragDelegate.$el)) { return; }
            this.updateDeltaViaScroll();
            this.moveDrag(e);
        });

        // End Drag
        document.addEventListener("mouseup", (e) => {
            if (!this.dragDelegate) { return; }
            let me = this;
            setTimeout(function () { me.endDrag(e); }, 0);
        });

        // Cancel Drag
        document.addEventListener('mouseout', (e) => {
            if (!this.dragDelegate) { return; }
            let from = e.relatedTarget || e.toElement;
            if (!from || from.nodeName == "HTML") { this.endDrag(e); }
        });

        // If Dragging, Cancel Click
        document.addEventListener("click", (e) => {
            if (!this.$el.contains(e.target)) { return; }
            if (!this.dragDelegate) { return; }
            e.stopPropagation();
        }, true);

    }
}
