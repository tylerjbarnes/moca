export default {
    data () { return {
        dragStart: null,
        dragDelegate: null,
        dropDelegateEl: null,
        previousDropzoneEls: [],
        payload: null
    }},
    methods: {
        startDrag (e, dragDelegate) {
            this.dragStart = {
                x: e.clientX,
                y: e.clientY
            }
            this.dragDelegate = dragDelegate;
            this.payload = dragDelegate.payload;
            bus.$emit('didStartDrag', dragDelegate.payload);
        },
        moveDrag (e) {

            // Update Drag Delta
            let x = event.pageX - this.dragStart.x;
            let y = event.pageY - this.dragStart.y;
            this.dragDelegate.dragDelta = {x,y};

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
            bus.$emit('didEndDrag', e);

            if (this.dropDelegateEl) {
                this.dropDelegateEl.dispatchEvent(
                    new CustomEvent('drop', {detail:this.payload})
                );
                this.dropDelegateEl = null;
            }

        }
    },
    created () {

        // Start Drag
        bus.$on('startDrag', (e, dragDelegate) => {
            if (!this.$el.contains(e.target)) { return; }
            this.startDrag(e, dragDelegate);
        });

        // Move Drag
        document.addEventListener('mousemove', (e) => {
            if (!this.dragDelegate) { return; }
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
