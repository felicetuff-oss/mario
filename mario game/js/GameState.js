export const States = {
    LOADING: 'loading',
    START_SCREEN: 'start_screen',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'game_over',
    LEVEL_COMPLETE: 'level_complete'
};

export default class GameState {
    constructor() {
        this.currentState = States.LOADING;
        this.listeners = new Map();
    }

    set(state) {
        if (this.currentState === state) return;

        console.log(`State transition: ${this.currentState} -> ${state}`);
        const oldState = this.currentState;
        this.currentState = state;

        if (this.listeners.has(state)) {
            this.listeners.get(state).forEach(callback => callback(oldState));
        }
    }

    get() {
        return this.currentState;
    }

    onEnter(state, callback) {
        if (!this.listeners.has(state)) {
            this.listeners.set(state, []);
        }
        this.listeners.get(state).push(callback);
    }
}
