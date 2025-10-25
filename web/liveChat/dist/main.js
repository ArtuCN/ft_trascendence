"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const App_1 = require("./App");
const Testdiv_1 = require("./components/Testdiv");
document.addEventListener('DOMContentLoaded', () => {
    const app = new App_1.App();
    app.appendComponent(Testdiv_1.default);
});
