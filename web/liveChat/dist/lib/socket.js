"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startSocket = exports.io = void 0;
// @ts-ignore
const socket_io_1 = require("socket.io");
const server_1 = require("./server");
function startSocket() {
    console.log("socket function");
    try {
        exports.io = new socket_io_1.Server(server_1.fastifyServer, {
            cors: {
                origin: "http://localhost:5173",
                methods: ["GET", "POST"]
            }
        });
        exports.io.on('connection', (socket) => {
            console.log("a user connected:", socket.id);
            socket.on("disconnect", () => {
                console.log("user disconnected:", socket.id);
            });
            socket.on("chat:message", (msg) => {
                console.log("message:", msg);
                exports.io?.emit("chat:message", msg);
            });
        });
        console.log("Socket.io server started");
    }
    catch (error) {
        console.log(error);
    }
}
exports.startSocket = startSocket;
