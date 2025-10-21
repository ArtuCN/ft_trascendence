"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const server_1 = require("./server");
const socket_1 = require("./socket");
async function main() {
    try {
        await (0, server_1.startServer)();
        (0, socket_1.startSocket)();
    }
    catch (err) {
        console.log(err);
    }
}
main();
