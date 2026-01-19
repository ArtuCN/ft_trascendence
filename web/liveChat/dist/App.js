"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
class App {
    constructor() {
        this.root = document.getElementById('app')
            || this.createRoot();
    }
    createRoot() {
        const root = document.createElement('div');
        root.id = 'app';
        document.body.appendChild(root);
        return (root);
    }
    appendComponent(component) {
        this.root.appendChild(component());
    }
}
exports.App = App;
