export default class InputHandler {
    constructor() {
        this.states = new Map();
        this.actions = new Map();

        this.handleEvent = this.handleEvent.bind(this);
    }

    addMapping(code, callback) {
        this.actions.set(code, callback);
    }

    handleEvent(event) {
        const { code } = event;

        if (!this.actions.has(code)) {
            return;
        }

        event.preventDefault();

        const keyState = event.type === 'keydown' ? 1 : 0;

        if (this.states.get(code) === keyState) {
            return;
        }

        this.states.set(code, keyState);
        this.actions.get(code)(keyState);
    }

    listenTo(window) {
        ['keydown', 'keyup'].forEach(eventName => {
            window.addEventListener(eventName, this.handleEvent);
        });
    }
}
